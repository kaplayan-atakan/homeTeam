import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

// Modüller - SOLID: Single Responsibility Principle
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { MusicModule } from './modules/music/music.module';
import { WebsocketModule } from './websocket/websocket.module';

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

    // İş mantığı modülleri - Modüler mimari
    AuthModule,
    UsersModule,
    TasksModule,
    NotificationsModule,
    MusicModule,
    WebsocketModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
