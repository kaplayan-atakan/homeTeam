import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import {
  CreateNotificationDto,
  BulkCreateNotificationDto,
  UpdateNotificationDto,
  NotificationFilterDto,
  MarkAsReadDto,
  MarkAllAsReadDto,
  ScheduleNotificationDto,
  NotificationStatsDto,
} from './dto/notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.schema';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async createNotification(@Body() createNotificationDto: CreateNotificationDto) {
    try {
      const notification = await this.notificationsService.create(createNotificationDto);
      return {
        success: true,
        message: 'Bildirim başarıyla oluşturuldu',
        data: notification,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Bildirim oluşturulurken hata oluştu',
        error: error.message,
      };
    }
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async createBulkNotifications(@Body() bulkCreateDto: BulkCreateNotificationDto) {
    try {
      const notifications = await this.notificationsService.createBulk(bulkCreateDto);
      return {
        success: true,
        message: 'Toplu bildirimler başarıyla oluşturuldu',
        data: notifications,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Toplu bildirimler oluşturulurken hata oluştu',
        error: error.message,
      };
    }
  }

  @Post('schedule')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async scheduleNotification(@Body() scheduleDto: ScheduleNotificationDto) {
    try {
      const notification = await this.notificationsService.scheduleNotification(scheduleDto);
      return {
        success: true,
        message: 'Bildirim başarıyla zamanlandı',
        data: notification,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Bildirim zamanlanırken hata oluştu',
        error: error.message,
      };
    }
  }

  @Get()
  async getUserNotifications(
    @Request() req,
    @Query() filterDto: NotificationFilterDto,
  ) {
    try {
      const result = await this.notificationsService.findUserNotifications(
        req.user.userId,
        filterDto,
      );
      return {
        success: true,
        message: 'Bildirimler başarıyla listelendi',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Bildirimler listelenirken hata oluştu',
        error: error.message,
      };
    }
  }

  @Get('stats')
  async getNotificationStats(
    @Request() req,
    @Query() statsDto: NotificationStatsDto,
  ) {
    try {
      const stats = await this.notificationsService.getStats(statsDto, req.user.userId);
      return {
        success: true,
        message: 'Bildirim istatistikleri başarıyla getirildi',
        data: stats,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Bildirim istatistikleri getirilirken hata oluştu',
        error: error.message,
      };
    }
  }

  @Patch(':id')
  async updateNotification(
    @Param('id') id: string,
    @Body() updateDto: UpdateNotificationDto,
    @Request() req,
  ) {
    try {
      const notification = await this.notificationsService.update(id, updateDto, req.user.userId);
      return {
        success: true,
        message: 'Bildirim başarıyla güncellendi',
        data: notification,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Bildirim güncellenirken hata oluştu',
        error: error.message,
      };
    }
  }

  @Post('mark-read')
  @HttpCode(HttpStatus.OK)
  async markAsRead(@Body() markAsReadDto: MarkAsReadDto, @Request() req) {
    try {
      await this.notificationsService.markAsRead(markAsReadDto, req.user.userId);
      return {
        success: true,
        message: 'Bildirimler okundu olarak işaretlendi',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Bildirimler işaretlenirken hata oluştu',
        error: error.message,
      };
    }
  }

  @Post('mark-all-read')
  @HttpCode(HttpStatus.OK)
  async markAllAsRead(@Body() markAllDto: MarkAllAsReadDto, @Request() req) {
    try {
      await this.notificationsService.markAllAsRead(markAllDto, req.user.userId);
      return {
        success: true,
        message: 'Tüm bildirimler okundu olarak işaretlendi',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Bildirimler işaretlenirken hata oluştu',
        error: error.message,
      };
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteNotification(@Param('id') id: string, @Request() req) {
    try {
      await this.notificationsService.delete(id, req.user.userId);
      return {
        success: true,
        message: 'Bildirim başarıyla silindi',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Bildirim silinirken hata oluştu',
        error: error.message,
      };
    }
  }

  // Hızlı bildirim endpoint'leri
  @Post('quick/task-assigned')
  @HttpCode(HttpStatus.CREATED)
  async createTaskAssignedNotification(
    @Body() data: {
      assigneeId: string;
      taskTitle: string;
      taskId: string;
      groupId?: string;
    },
    @Request() req,
  ) {
    try {
      const notification = await this.notificationsService.createTaskAssignedNotification(
        data.assigneeId,
        data.taskTitle,
        req.user.userId,
        data.taskId,
        data.groupId,
      );
      return {
        success: true,
        message: 'Görev atama bildirimi gönderildi',
        data: notification,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Bildirim gönderilirken hata oluştu',
        error: error.message,
      };
    }
  }

  @Post('quick/task-due-soon')
  @HttpCode(HttpStatus.CREATED)
  async createTaskDueSoonNotification(
    @Body() data: {
      userId: string;
      taskTitle: string;
      dueDate: string;
      taskId: string;
      groupId?: string;
    },
  ) {
    try {
      const notification = await this.notificationsService.createTaskDueSoonNotification(
        data.userId,
        data.taskTitle,
        new Date(data.dueDate),
        data.taskId,
        data.groupId,
      );
      return {
        success: true,
        message: 'Görev süre uyarı bildirimi gönderildi',
        data: notification,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Bildirim gönderilirken hata oluştu',
        error: error.message,
      };
    }
  }

  @Post('quick/group-invite')
  @HttpCode(HttpStatus.CREATED)
  async createGroupInviteNotification(
    @Body() data: {
      userId: string;
      groupName: string;
      groupId: string;
      inviteToken: string;
    },
    @Request() req,
  ) {
    try {
      const notification = await this.notificationsService.createGroupInviteNotification(
        data.userId,
        data.groupName,
        req.user.userId,
        data.groupId,
        data.inviteToken,
      );
      return {
        success: true,
        message: 'Grup davet bildirimi gönderildi',
        data: notification,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Bildirim gönderilirken hata oluştu',
        error: error.message,
      };
    }
  }
}
