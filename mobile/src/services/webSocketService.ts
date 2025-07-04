import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import Config from '../config/config';

// WebSocket Event türleri
export interface WebSocketEvents {
  // Client -> Server
  'join_group': (groupId: string) => void;
  'leave_group': (groupId: string) => void;
  'task_update': (data: any) => void;
  'add_comment': (data: any) => void;
  'typing_start': (data: { taskId: string; userId: string }) => void;
  'typing_stop': (data: { taskId: string; userId: string }) => void;

  // Server -> Client
  'task_updated': (data: any) => void;
  'task_created': (data: any) => void;
  'task_deleted': (data: any) => void;
  'task_completed': (data: any) => void;
  'comment_added': (data: any) => void;
  'notification': (data: any) => void;
  'sla_warning': (data: any) => void;
  'group_updated': (data: any) => void;
  'member_joined': (data: any) => void;
  'member_left': (data: any) => void;
  'user_typing': (data: { taskId: string; userId: string; userName: string }) => void;
  'user_stopped_typing': (data: { taskId: string; userId: string }) => void;
  'connect': () => void;
  'disconnect': () => void;
  'connect_error': (error: Error) => void;
  'reconnect': (attemptNumber: number) => void;
  'reconnect_error': (error: Error) => void;
}

export type WebSocketEventName = keyof WebSocketEvents;

export interface WebSocketServiceConfig {
  autoConnect?: boolean;
  enableLogging?: boolean;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
}

class WebSocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private eventListeners = new Map<string, Function[]>();
  private joinedGroups = new Set<string>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private enableLogging = false;

  constructor(config: WebSocketServiceConfig = {}) {
    this.maxReconnectAttempts = config.maxReconnectAttempts || 5;
    this.reconnectDelay = config.reconnectDelay || 1000;
    this.enableLogging = config.enableLogging || __DEV__;

    if (config.autoConnect) {
      this.connect();
    }
  }

  // Bağlantı kur
  async connect(): Promise<void> {
    if (this.socket?.connected) {
      this.log('Already connected to WebSocket');
      return;
    }

    try {
      const token = await AsyncStorage.getItem(Config.STORAGE_KEYS.AUTH_TOKEN);
      
      this.socket = io(Config.WEBSOCKET_URL, {
        auth: {
          token,
        },
        timeout: Config.WEBSOCKET_TIMEOUT,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        forceNew: true,
      });

      this.setupEventListeners();
      this.log('WebSocket connection initiated');
    } catch (error) {
      this.log('WebSocket connection error:', error);
      throw error;
    }
  }

  // Bağlantıyı kes
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.joinedGroups.clear();
      this.log('WebSocket disconnected');
    }
  }

  // Event listener'ları ayarla
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Bağlantı olayları
    this.socket.on('connect', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.log('✅ WebSocket connected');
      
      // Önceden katılınan gruplara tekrar katıl
      this.rejoinGroups();
      
      // Custom event listeners'ı çağır
      this.emitToListeners('connect');
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      this.log('❌ WebSocket disconnected:', reason);
      this.emitToListeners('disconnect');
    });

    this.socket.on('connect_error', (error) => {
      this.log('🔥 WebSocket connection error:', error);
      this.emitToListeners('connect_error', error);
      
      if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
        Alert.alert(
          'Kimlik Doğrulama Hatası',
          'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.',
          [{ text: 'Tamam' }]
        );
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      this.log('🔄 WebSocket reconnected after', attemptNumber, 'attempts');
      this.emitToListeners('reconnect', attemptNumber);
    });

    this.socket.on('reconnect_error', (error) => {
      this.reconnectAttempts++;
      this.log('💥 WebSocket reconnection error:', error, 'Attempt:', this.reconnectAttempts);
      this.emitToListeners('reconnect_error', error);
    });

    // Uygulama spesifik olaylar
    this.socket.on('task_updated', (data) => {
      this.log('📝 Task updated:', data);
      this.emitToListeners('task_updated', data);
    });

    this.socket.on('task_created', (data) => {
      this.log('✨ Task created:', data);
      this.emitToListeners('task_created', data);
    });

    this.socket.on('task_completed', (data) => {
      this.log('✅ Task completed:', data);
      this.emitToListeners('task_completed', data);
    });

    this.socket.on('comment_added', (data) => {
      this.log('💬 Comment added:', data);
      this.emitToListeners('comment_added', data);
    });

    this.socket.on('notification', (data) => {
      this.log('🔔 Notification received:', data);
      this.emitToListeners('notification', data);
    });

    this.socket.on('sla_warning', (data) => {
      this.log('⚠️ SLA warning:', data);
      this.emitToListeners('sla_warning', data);
    });

    this.socket.on('group_updated', (data) => {
      this.log('👥 Group updated:', data);
      this.emitToListeners('group_updated', data);
    });

    this.socket.on('member_joined', (data) => {
      this.log('👤 Member joined:', data);
      this.emitToListeners('member_joined', data);
    });

    this.socket.on('member_left', (data) => {
      this.log('👋 Member left:', data);
      this.emitToListeners('member_left', data);
    });

    this.socket.on('user_typing', (data) => {
      this.log('⌨️ User typing:', data);
      this.emitToListeners('user_typing', data);
    });

    this.socket.on('user_stopped_typing', (data) => {
      this.log('⌨️ User stopped typing:', data);
      this.emitToListeners('user_stopped_typing', data);
    });
  }

  // Gruplara tekrar katıl (reconnect sonrası)
  private rejoinGroups(): void {
    this.joinedGroups.forEach(groupId => {
      this.joinGroup(groupId);
    });
  }

  // Event listener ekle
  on<T extends WebSocketEventName>(eventName: T, callback: WebSocketEvents[T]): void {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, []);
    }
    this.eventListeners.get(eventName)?.push(callback);
  }

  // Event listener kaldır
  off<T extends WebSocketEventName>(eventName: T, callback?: WebSocketEvents[T]): void {
    const listeners = this.eventListeners.get(eventName);
    if (!listeners) return;

    if (callback) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    } else {
      this.eventListeners.set(eventName, []);
    }
  }

  // Event listener'lara event gönder
  private emitToListeners(eventName: string, ...args: any[]): void {
    const listeners = this.eventListeners.get(eventName);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          this.log('Error in event listener:', error);
        }
      });
    }
  }

  // Server'a event gönder
  emit<T extends WebSocketEventName>(eventName: T, data?: any): void {
    if (!this.socket?.connected) {
      this.log('Cannot emit event - not connected:', eventName);
      return;
    }

    this.socket.emit(eventName, data);
    this.log('📤 Emitted event:', eventName, data);
  }

  // Gruba katıl
  joinGroup(groupId: string): void {
    if (!this.isConnected) {
      this.log('Cannot join group - not connected');
      return;
    }

    this.emit('join_group', groupId);
    this.joinedGroups.add(groupId);
    this.log('👥 Joined group:', groupId);
  }

  // Gruptan ayrıl
  leaveGroup(groupId: string): void {
    if (!this.isConnected) {
      return;
    }

    this.emit('leave_group', groupId);
    this.joinedGroups.delete(groupId);
    this.log('👋 Left group:', groupId);
  }

  // Görev güncelleme gönder
  sendTaskUpdate(taskData: any): void {
    this.emit('task_update', taskData);
  }

  // Yorum ekleme gönder
  sendComment(commentData: any): void {
    this.emit('add_comment', commentData);
  }

  // Typing indicator başlat
  startTyping(taskId: string, userId: string): void {
    this.emit('typing_start', { taskId, userId });
  }

  // Typing indicator durdur
  stopTyping(taskId: string, userId: string): void {
    this.emit('typing_stop', { taskId, userId });
  }

  // Bağlantı durumu
  isSocketConnected(): boolean {
    return this.isConnected;
  }

  // Katılınan grupların listesi
  getJoinedGroups(): Set<string> {
    return new Set(this.joinedGroups);
  }

  // Log helper
  private log(...args: any[]): void {
    if (this.enableLogging) {
      console.log('[WebSocket]', ...args);
    }
  }

  // Token güncelleme (authentication yenilendikten sonra)
  async updateAuthToken(): Promise<void> {
    if (!this.socket) return;

    try {
      const token = await AsyncStorage.getItem(Config.STORAGE_KEYS.AUTH_TOKEN);
      this.socket.auth = { token };
      
      // Reconnect to apply new auth
      if (this.isConnected) {
        this.socket.disconnect();
        this.socket.connect();
      }
    } catch (error) {
      this.log('Error updating auth token:', error);
    }
  }

  // Cleanup (component unmount time)
  cleanup(): void {
    this.eventListeners.clear();
    this.disconnect();
  }
}

// Singleton instance
export const webSocketService = new WebSocketService({ 
  autoConnect: false,
  enableLogging: __DEV__,
  maxReconnectAttempts: 5,
  reconnectDelay: 1000,
});

export default webSocketService;
