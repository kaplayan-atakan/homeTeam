import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
// import { Cron, CronExpression } from '@nestjs/schedule'; // Package kurulu olmadığında
import {
  Notification,
  NotificationDocument,
  NotificationType,
  NotificationPriority,
  NotificationStatus,
} from './notification.schema';
import {
  CreateNotificationDto,
  BulkCreateNotificationDto,
  UpdateNotificationDto,
  NotificationFilterDto,
  MarkAsReadDto,
  MarkAllAsReadDto,
  NotificationSettingsDto,
  ScheduleNotificationDto,
  NotificationStatsDto,
} from './dto/notification.dto';

// SOLID: Single Responsibility Principle - Bildirim işlemleri için tek sorumluluk
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
  ) {}

  // Tekil bildirim oluşturma
  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    try {
      const notification = new this.notificationModel({
        ...createNotificationDto,
        userId: new Types.ObjectId(createNotificationDto.userId),
        triggeredBy: createNotificationDto.triggeredBy 
          ? new Types.ObjectId(createNotificationDto.triggeredBy) 
          : undefined,
        groupId: createNotificationDto.groupId 
          ? new Types.ObjectId(createNotificationDto.groupId) 
          : undefined,
        taskId: createNotificationDto.taskId 
          ? new Types.ObjectId(createNotificationDto.taskId) 
          : undefined,
      });

      const savedNotification = await notification.save();

      // Eğer anında gönderilecekse gönder
      if (!createNotificationDto.scheduledFor || 
          new Date(createNotificationDto.scheduledFor) <= new Date()) {
        await this.sendNotification(savedNotification);
      }

      return savedNotification;
    } catch (error) {
      this.logger.error('Bildirim oluşturma hatası:', error);
      throw new BadRequestException('Bildirim oluşturulamadı');
    }
  }

  // Toplu bildirim oluşturma
  async createBulk(bulkCreateDto: BulkCreateNotificationDto): Promise<Notification[]> {
    try {
      const notifications = bulkCreateDto.userIds.map(userId => ({
        ...bulkCreateDto,
        userId: new Types.ObjectId(userId),
        triggeredBy: bulkCreateDto.triggeredBy 
          ? new Types.ObjectId(bulkCreateDto.triggeredBy) 
          : undefined,
        groupId: bulkCreateDto.groupId 
          ? new Types.ObjectId(bulkCreateDto.groupId) 
          : undefined,
        taskId: bulkCreateDto.taskId 
          ? new Types.ObjectId(bulkCreateDto.taskId) 
          : undefined,
      }));

      const savedNotifications = await this.notificationModel.insertMany(notifications);

      // Gönderim işlemlerini başlat
      for (const notification of savedNotifications) {
        await this.sendNotification(notification);
      }

      return savedNotifications;
    } catch (error) {
      this.logger.error('Toplu bildirim oluşturma hatası:', error);
      throw new BadRequestException('Bildirimler oluşturulamadı');
    }
  }

  // Kullanıcının bildirimlerini listeleme
  async findUserNotifications(
    userId: string,
    filterDto: NotificationFilterDto
  ): Promise<{
    notifications: Notification[];
    total: number;
    unreadCount: number;
    page: number;
    limit: number;
  }> {
    const {
      type,
      status,
      priority,
      groupId,
      taskId,
      startDate,
      endDate,
      unreadOnly,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = filterDto;

    const query: any = {
      userId: new Types.ObjectId(userId),
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    };

    // Filtreler
    if (type) query.type = type;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (groupId) query.groupId = new Types.ObjectId(groupId);
    if (taskId) query.taskId = new Types.ObjectId(taskId);
    if (unreadOnly) query.status = { $ne: NotificationStatus.READ };

    // Tarih aralığı filtresi
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = startDate;
      if (endDate) query.createdAt.$lte = endDate;
    }

    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      this.notificationModel
        .find(query)
        .populate('triggeredBy', 'firstName lastName profileImage')
        .populate('groupId', 'name avatar')
        .populate('taskId', 'title')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.notificationModel.countDocuments(query),
      this.notificationModel.countDocuments({
        userId: new Types.ObjectId(userId),
        status: { $ne: NotificationStatus.READ },
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: { $gt: new Date() } }
        ]
      })
    ]);

    return {
      notifications,
      total,
      unreadCount,
      page,
      limit
    };
  }

  // Bildirimi güncelleme
  async update(
    notificationId: string,
    updateDto: UpdateNotificationDto,
    userId: string
  ): Promise<Notification> {
    const notification = await this.notificationModel.findOne({
      _id: notificationId,
      userId: new Types.ObjectId(userId)
    });

    if (!notification) {
      throw new NotFoundException('Bildirim bulunamadı');
    }

    Object.assign(notification, updateDto);
    return notification.save();
  }

  // Bildirimi okundu olarak işaretle
  async markAsRead(markAsReadDto: MarkAsReadDto, userId: string): Promise<void> {
    await this.notificationModel.updateMany(
      {
        _id: { $in: markAsReadDto.notificationIds.map(id => new Types.ObjectId(id)) },
        userId: new Types.ObjectId(userId),
        status: { $ne: NotificationStatus.READ }
      },
      {
        $set: {
          status: NotificationStatus.READ,
          readAt: new Date()
        }
      }
    );
  }

  // Tümünü okundu olarak işaretle
  async markAllAsRead(markAllDto: MarkAllAsReadDto, userId: string): Promise<void> {
    const query: any = {
      userId: new Types.ObjectId(userId),
      status: { $ne: NotificationStatus.READ }
    };

    if (markAllDto.type) query.type = markAllDto.type;
    if (markAllDto.groupId) query.groupId = new Types.ObjectId(markAllDto.groupId);

    await this.notificationModel.updateMany(query, {
      $set: {
        status: NotificationStatus.READ,
        readAt: new Date()
      }
    });
  }

  // Bildirimi silme
  async delete(notificationId: string, userId: string): Promise<void> {
    const result = await this.notificationModel.deleteOne({
      _id: notificationId,
      userId: new Types.ObjectId(userId)
    });

    if (result.deletedCount === 0) {
      throw new NotFoundException('Bildirim bulunamadı');
    }
  }

  // Zamanlanmış bildirim oluşturma
  async scheduleNotification(scheduleDto: ScheduleNotificationDto): Promise<Notification> {
    if (new Date(scheduleDto.scheduledFor) <= new Date()) {
      throw new BadRequestException('Zamanlanmış tarih gelecekte olmalıdır');
    }

    return this.create(scheduleDto);
  }

  // Bildirim gönderme (internal)
  private async sendNotification(notification: NotificationDocument): Promise<void> {
    try {
      // Push notification gönder
      if (notification.isPush) {
        await this.sendPushNotification(notification);
      }

      // E-posta gönder
      if (notification.isEmail) {
        await this.sendEmailNotification(notification);
      }

      // SMS gönder
      if (notification.isSMS) {
        await this.sendSMSNotification(notification);
      }

      // Gönderildi olarak işaretle
      notification.status = NotificationStatus.SENT;
      notification.sentAt = new Date();
      await notification.save();

      this.logger.log(`Bildirim gönderildi: ${notification._id}`);
    } catch (error) {
      this.logger.error(`Bildirim gönderme hatası: ${notification._id}`, error);
    }
  }

  // Push notification gönderme (stub)
  private async sendPushNotification(notification: NotificationDocument): Promise<void> {
    // TODO: Firebase Cloud Messaging veya benzeri servis entegrasyonu
    this.logger.log(`Push notification gönderilecek: ${notification.title}`);
  }

  // E-posta gönderme (stub)
  private async sendEmailNotification(notification: NotificationDocument): Promise<void> {
    // TODO: Nodemailer veya AWS SES entegrasyonu
    this.logger.log(`E-posta gönderilecek: ${notification.title}`);
  }

  // SMS gönderme (stub)
  private async sendSMSNotification(notification: NotificationDocument): Promise<void> {
    // TODO: Twilio veya benzeri SMS servisi entegrasyonu
    this.logger.log(`SMS gönderilecek: ${notification.title}`);
  }

  // Zamanlanmış bildirimleri kontrol et ve gönder (Cron job)
  // @Cron(CronExpression.EVERY_MINUTE) // Package kurulu olmadığında yorum
  async processScheduledNotifications(): Promise<void> {
    const notifications = await this.notificationModel.find({
      status: NotificationStatus.PENDING,
      scheduledFor: { $lte: new Date() },
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    }).limit(100); // Batch olarak işle

    for (const notification of notifications) {
      await this.sendNotification(notification);
    }

    this.logger.log(`${notifications.length} zamanlanmış bildirim işlendi`);
  }

  // Süresi dolmuş bildirimleri temizle (Cron job)
  // @Cron(CronExpression.EVERY_DAY_AT_2AM) // Package kurulu olmadığında yorum
  async cleanupExpiredNotifications(): Promise<void> {
    const result = await this.notificationModel.deleteMany({
      expiresAt: { $lt: new Date() }
    });

    this.logger.log(`${result.deletedCount} süresi dolmuş bildirim temizlendi`);
  }

  // Bildirim istatistikleri
  async getStats(statsDto: NotificationStatsDto, userId: string): Promise<any> {
    const {
      startDate,
      endDate,
      groupId,
      byType,
      byStatus
    } = statsDto;

    const matchQuery: any = {
      userId: new Types.ObjectId(userId)
    };

    if (groupId) matchQuery.groupId = new Types.ObjectId(groupId);
    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = startDate;
      if (endDate) matchQuery.createdAt.$lte = endDate;
    }

    const pipeline: any[] = [{ $match: matchQuery }];

    if (byType) {
      pipeline.push(
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      );
    } else if (byStatus) {
      pipeline.push(
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      );
    } else {
      pipeline.push(
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            read: { $sum: { $cond: [{ $eq: ['$status', NotificationStatus.READ] }, 1, 0] } },
            pending: { $sum: { $cond: [{ $eq: ['$status', NotificationStatus.PENDING] }, 1, 0] } },
            sent: { $sum: { $cond: [{ $eq: ['$status', NotificationStatus.SENT] }, 1, 0] } }
          }
        }
      );
    }

    const results = await this.notificationModel.aggregate(pipeline);
    return results;
  }

  // Hızlı bildirim şablonları
  async createTaskAssignedNotification(
    assigneeId: string,
    taskTitle: string,
    assignedBy: string,
    taskId: string,
    groupId?: string
  ): Promise<Notification> {
    return this.create({
      userId: assigneeId,
      type: NotificationType.TASK_ASSIGNED,
      title: 'Yeni Görev Atandı',
      message: `"${taskTitle}" görevi size atandı`,
      data: { taskId, assignedBy },
      priority: NotificationPriority.MEDIUM,
      triggeredBy: assignedBy,
      taskId,
      groupId,
      isPush: true,
      isInApp: true,
    });
  }

  async createTaskDueSoonNotification(
    userId: string,
    taskTitle: string,
    dueDate: Date,
    taskId: string,
    groupId?: string
  ): Promise<Notification> {
    const timeLeft = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60)); // hours
    
    return this.create({
      userId,
      type: NotificationType.TASK_DUE_SOON,
      title: 'Görev Süresi Yaklaşıyor',
      message: `"${taskTitle}" görevinin süresi ${timeLeft} saat içinde dolacak`,
      data: { taskId, timeLeft },
      priority: NotificationPriority.HIGH,
      taskId,
      groupId,
      isPush: true,
      isInApp: true,
    });
  }

  async createGroupInviteNotification(
    userId: string,
    groupName: string,
    invitedBy: string,
    groupId: string,
    inviteToken: string
  ): Promise<Notification> {
    return this.create({
      userId,
      type: NotificationType.GROUP_INVITE,
      title: 'Grup Daveti',
      message: `"${groupName}" grubuna davet edildiniz`,
      data: { groupId, inviteToken },
      priority: NotificationPriority.MEDIUM,
      triggeredBy: invitedBy,
      groupId,
      isPush: true,
      isEmail: true,
      isInApp: true,
    });
  }
}
