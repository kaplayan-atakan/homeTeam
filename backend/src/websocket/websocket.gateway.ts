import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: any;
}

// SOLID: Single Responsibility Principle - WebSocket bağlantıları ve gerçek zamanlı iletişim
@WebSocketGateway({
  cors: {
    origin: (origin: string, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow all localhost origins in development
      if (!origin) return callback(null, true);
      try {
        const url = new URL(origin);
        if (['localhost', '127.0.0.1'].includes(url.hostname)) return callback(null, true);
      } catch {}
      if (process.env.FRONTEND_URL && origin.startsWith(process.env.FRONTEND_URL)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  },
  namespace: '/ws',
})
export class WebsocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebsocketGateway.name);
  private connectedUsers = new Map<string, AuthenticatedSocket[]>(); // userId -> socket[]
  private roomUsers = new Map<string, Set<string>>(); // roomId -> Set<userId>

  constructor(
    private jwtService: JwtService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Token doğrulama
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');
      
      if (!token) {
        this.logger.warn('Connection rejected: No token provided');
        client.disconnect();
        return;
      }

      // JWT token'ı doğrula
      const payload = this.jwtService.verify(token);
      client.userId = payload.sub;
      client.user = payload;

      // Kullanıcıyı bağlı kullanıcılar listesine ekle
      if (!this.connectedUsers.has(client.userId)) {
        this.connectedUsers.set(client.userId, []);
      }
      this.connectedUsers.get(client.userId).push(client);

      this.logger.log(`User ${client.userId} connected`);
      
      // Kullanıcının online olduğunu yayınla
      client.broadcast.emit('user_online', {
        userId: client.userId,
        timestamp: new Date(),
      });

    } catch (error) {
      this.logger.error('Connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      // Kullanıcıyı bağlı kullanıcılar listesinden çıkar
      const userSockets = this.connectedUsers.get(client.userId);
      if (userSockets) {
        const index = userSockets.indexOf(client);
        if (index > -1) {
          userSockets.splice(index, 1);
        }
        
        // Kullanıcının hiç bağlantısı kalmadıysa tamamen sil
        if (userSockets.length === 0) {
          this.connectedUsers.delete(client.userId);
          
          // Kullanıcının offline olduğunu yayınla
          client.broadcast.emit('user_offline', {
            userId: client.userId,
            timestamp: new Date(),
          });
        }
      }

      // Odalardan çıkar
      this.leaveAllRooms(client);
      
      this.logger.log(`User ${client.userId} disconnected`);
    }
  }

  // Gruba mesaj gönderme - Public method for external use
  emitToGroup(groupId: string, event: string, data: any) {
    this.server.to(`group_${groupId}`).emit(event, data);
  }

  // Kullanıcıya özel mesaj gönderme - Public method for external use
  emitToUser(userId: string, event: string, data: any) {
    this.sendToUser(userId, event, data);
  }

  // Gruba katılma
  @SubscribeMessage('join_group')
  async handleJoinGroup(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      const roomName = `group_${data.roomId}`;
      client.join(roomName);

      // Oda kullanıcılarını güncelle
      if (!this.roomUsers.has(roomName)) {
        this.roomUsers.set(roomName, new Set());
      }
      this.roomUsers.get(roomName).add(client.userId);

      // Gruba katıldığını bildir
      client.to(roomName).emit('user_joined_group', {
        userId: client.userId,
        groupId: data.roomId,
        timestamp: new Date(),
      });

      client.emit('joined_group', {
        groupId: data.roomId,
        memberCount: this.roomUsers.get(roomName).size,
      });

      this.logger.log(`User ${client.userId} joined group ${data.roomId}`);
    } catch (error) {
      this.logger.error('Join group error:', error);
      client.emit('error', { message: 'Gruba katılırken hata oluştu' });
    }
  }

  // Gruptan ayrılma
  @SubscribeMessage('leave_group')
  handleLeaveGroup(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const roomName = `group_${data.roomId}`;
    client.leave(roomName);

    // Oda kullanıcılarını güncelle
    if (this.roomUsers.has(roomName)) {
      this.roomUsers.get(roomName).delete(client.userId);
    }

    // Gruptan ayrıldığını bildir
    client.to(roomName).emit('user_left_group', {
      userId: client.userId,
      groupId: data.roomId,
      timestamp: new Date(),
    });

    this.logger.log(`User ${client.userId} left group ${data.roomId}`);
  }

  // Private helper methods
  private sendToUser(userId: string, event: string, data: any) {
    const userSockets = this.connectedUsers.get(userId);
    if (userSockets) {
      userSockets.forEach(socket => {
        socket.emit(event, data);
      });
    }
  }

  private leaveAllRooms(client: AuthenticatedSocket) {
    const rooms = Array.from(client.rooms);
    rooms.forEach(room => {
      if (room !== client.id) {
        client.leave(room);
        if (this.roomUsers.has(room)) {
          this.roomUsers.get(room).delete(client.userId);
        }
      }
    });
  }

  // Oda bilgilerini alma
  getRoomUsers(roomId: string): string[] {
    return Array.from(this.roomUsers.get(roomId) || []);
  }

  getConnectedUserCount(): number {
    return this.connectedUsers.size;
  }

  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }
}
