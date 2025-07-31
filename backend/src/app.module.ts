import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

// Modüller - SOLID: Single Responsibility Principle
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { GroupsModule } from './modules/groups/groups.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { MusicModule } from './modules/music/music.module';
import { LogsModule } from './modules/logs/logs.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { WebsocketModule } from './websocket/websocket.module';
import { CacheModule } from './cache/cache.module';

@Module({
  imports: [
    // Konfigürasyon yönetimi
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // MongoDB bağlantısı
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI') || 'mongodb://localhost:27017/hometeam',
      }),
      inject: [ConfigService],
    }),

    // Cache Management - Redis entegrasyonu
    CacheModule,

    // İş mantığı modülleri - Modüler mimari
    AuthModule,
    UsersModule,
    GroupsModule,
    NotificationsModule,
    TasksModule,
    MusicModule,
    LogsModule,
    AnalyticsModule,
    WebsocketModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
