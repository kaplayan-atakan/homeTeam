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
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://172.25.144.1:3000',
      process.env.FRONTEND_URL || 'http://localhost:3000'
    ],
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
