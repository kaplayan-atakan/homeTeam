import { 
  Controller, 
  Post, 
  Body, 
  Delete, 
  Get, 
  Param, 
  Query, 
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { NotificationService, SendNotificationDto, RegisterDeviceTokenDto } from './notification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe({ 
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true 
}))
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // Device token kaydetme
  @Post('register-device')
  @HttpCode(HttpStatus.CREATED)
  async registerDevice(
    @Request() req,
    @Body() body: { token: string; platform: 'ios' | 'android' },
  ) {
    try {
      const result = await this.notificationService.registerDeviceToken({
        userId: req.user.id,
        token: body.token,
        platform: body.platform,
      });

      return {
        success: true,
        message: 'Device token başarıyla kaydedildi',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Device token silme
  @Delete('unregister-device')
  @HttpCode(HttpStatus.OK)
  async unregisterDevice(
    @Request() req,
    @Body() body: { token: string },
  ) {
    try {
      await this.notificationService.unregisterDeviceToken(req.user.id, body.token);

      return {
        success: true,
        message: 'Device token başarıyla silindi',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Bildirim gönderme (admin veya sistem tarafından)
  @Post('send')
  @HttpCode(HttpStatus.OK)
  async sendNotification(
    @Body() dto: SendNotificationDto,
  ) {
    try {
      const result = await this.notificationService.sendNotification(dto);

      return {
        success: result.success,
        message: result.success ? 'Bildirim başarıyla gönderildi' : 'Bildirim gönderilemedi',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Kullanıcının bildirim geçmişi
  @Get('history')
  @HttpCode(HttpStatus.OK)
  async getNotificationHistory(
    @Request() req,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
  ) {
    try {
      const result = await this.notificationService.getUserNotificationHistory(
        req.user.id,
        page,
        limit,
      );

      return {
        success: true,
        message: 'Bildirim geçmişi başarıyla alındı',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Bildirimi okundu olarak işaretle
  @Post(':id/read')
  @HttpCode(HttpStatus.OK)
  async markAsRead(@Param('id') id: string, @Request() req) {
    try {
      const result = await this.notificationService.markNotificationAsRead(id, req.user.id);

      return {
        success: result.success,
        message: result.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Okunmamış bildirim sayısı
  @Get('unread-count')
  @HttpCode(HttpStatus.OK)
  async getUnreadCount(@Request() req) {
    try {
      const count = await this.notificationService.getUnreadNotificationCount(req.user.id);

      return {
        success: true,
        message: 'Okunmamış bildirim sayısı alındı',
        data: { count },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: { count: 0 },
      };
    }
  }

  // Kullanıcının device token'larını getir
  @Get('device-tokens')
  @HttpCode(HttpStatus.OK)
  async getUserDeviceTokens(@Request() req) {
    try {
      const tokens = await this.notificationService.getUserDeviceTokens(req.user.id);

      return {
        success: true,
        message: 'Device token\'lar başarıyla alındı',
        data: tokens,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
