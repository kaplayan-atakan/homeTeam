import { ConfigService } from '@nestjs/config';
import { 
  DatabaseConfig, 
  AuthConfig, 
  MusicConfig, 
  AppConfig, 
  NotificationConfig 
} from './config.interface';

// SOLID: Dependency Inversion Principle - Soyutlamaya bağımlılık
export class ConfigurationService {
  constructor(private configService: ConfigService) {}

  get database(): DatabaseConfig {
    return {
      mongoUri: this.configService.get<string>('MONGODB_URI') || 'mongodb://localhost:27017/hometeam',
      redisUrl: this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379',
    };
  }

  get auth(): AuthConfig {
    return {
      jwtSecret: this.configService.get<string>('JWT_SECRET') || 'default-secret-change-in-production',
      jwtExpiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '7d',
      google: {
        clientId: this.configService.get<string>('GOOGLE_CLIENT_ID') || '',
        clientSecret: this.configService.get<string>('GOOGLE_CLIENT_SECRET') || '',
      },
      facebook: {
        appId: this.configService.get<string>('FACEBOOK_APP_ID') || '',
        appSecret: this.configService.get<string>('FACEBOOK_APP_SECRET') || '',
      },
    };
  }

  get music(): MusicConfig {
    return {
      spotify: {
        clientId: this.configService.get<string>('SPOTIFY_CLIENT_ID') || '',
        clientSecret: this.configService.get<string>('SPOTIFY_CLIENT_SECRET') || '',
      },
      youtube: {
        apiKey: this.configService.get<string>('YOUTUBE_API_KEY') || '',
      },
    };
  }

  get app(): AppConfig {
    return {
      port: +this.configService.get<number>('PORT') || 3001,
      nodeEnv: this.configService.get<string>('NODE_ENV') || 'development',
      frontendUrl: this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000',
    };
  }

  get notifications(): NotificationConfig {
    const smtp = {
      host: this.configService.get<string>('SMTP_HOST'),
      port: +this.configService.get<number>('SMTP_PORT'),
      user: this.configService.get<string>('SMTP_USER'),
      pass: this.configService.get<string>('SMTP_PASS'),
    };

    return {
      pushNotificationKey: this.configService.get<string>('PUSH_NOTIFICATION_KEY') || '',
      smtp: smtp.host ? smtp : undefined,
    };
  }
}
