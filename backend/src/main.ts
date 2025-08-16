import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ErrorLoggingService } from './modules/logs/error-logging.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Global exception filter - Error logging
  const errorLoggingService = app.get(ErrorLoggingService);
  app.useGlobalFilters(new GlobalExceptionFilter(errorLoggingService));
  
  // Global validation pipe - SOLID: Open/Closed Principle
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // CORS ayarları - güvenlik ve development
  app.enableCors({
    origin: (origin, callback) => {
      const allowed = [
        'http://localhost',
        'http://127.0.0.1',
        process.env.FRONTEND_URL || 'http://localhost:3000',
      ];
      // Allow undefined origin for tools/curl and same-origin
      if (!origin) return callback(null, true);
      try {
        const url = new URL(origin);
        const isLocalhost = ['localhost', '127.0.0.1'].includes(url.hostname);
        if (isLocalhost) return callback(null, true);
        if (allowed.some((a) => origin.startsWith(a))) return callback(null, true);
      } catch {}
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || 3001;

  await app.listen(port);
  console.log(`🚀 homeTeam Backend ${port} portunda çalışıyor`);
}

bootstrap();
