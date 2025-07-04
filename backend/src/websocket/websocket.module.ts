import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WebsocketGateway } from './websocket.gateway';
import { NotificationsModule } from '../modules/notifications/notifications.module';
import { GroupsModule } from '../modules/groups/groups.module';
import { MusicModule } from '../modules/music/music.module';

@Module({
  imports: [
    // JWT token doğrulama için
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'homeTeam-secret-key',
        signOptions: { 
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '24h' 
        },
      }),
      inject: [ConfigService],
    }),
    
    // İlgili modüller
    NotificationsModule,
    GroupsModule,
    MusicModule,
  ],
  providers: [WebsocketGateway],
  exports: [WebsocketGateway], // Diğer modüller tarafından kullanılabilmesi için
})
export class WebsocketModule {}
