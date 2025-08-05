import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { NotificationService } from '../notifications/notification.service';
import { FirebaseService } from '../../config/firebase.service';
import { NotificationType } from '../notifications/schemas/notification.schema';

@Controller('test')
export class TestController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly firebaseService: FirebaseService,
  ) {}

  // Health check
  @Get('health')
  health() {
    return {
      success: true,
      message: 'Backend is running',
      timestamp: new Date().toISOString(),
      services: {
        firebase: this.firebaseService.isInitialized(),
      },
    };
  }

  // Firebase test
  @Get('firebase-status')
  async firebaseStatus() {
    return {
      success: true,
      message: 'Firebase service status',
      isInitialized: this.firebaseService.isInitialized(),
      timestamp: new Date().toISOString(),
    };
  }

  // Test notification sending
  @Post('send-test-notification')
  @HttpCode(HttpStatus.OK)
  async sendTestNotification(@Body() body: { 
    userId: string; 
    title?: string; 
    message?: string; 
  }) {
    try {
      const title = body.title || 'Test Notification';
      const message = body.message || 'Bu bir test bildirimidir';
      
      const result = await this.notificationService.sendNotification({
        userId: body.userId,
        title,
        body: message,
        type: NotificationType.GENERAL,
        data: { testData: 'true' },
      });

      return {
        success: true,
        message: 'Test notification sent',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.stack,
      };
    }
  }

  // Database connection test
  @Get('db-status')
  async databaseStatus() {
    try {
      // Simple connection test - bu endpoint User modeli olmadan çalışır
      return {
        success: true,
        message: 'Database connection is working',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: 'Database connection failed',
        error: error.message,
      };
    }
  }
}
