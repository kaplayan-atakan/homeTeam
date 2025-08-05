import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FirebaseService } from '../../config/firebase.service';
import { DeviceToken, DeviceTokenDocument } from './schemas/device-token.schema';
import { 
  Notification, 
  NotificationDocument, 
  NotificationStatus,
  NotificationType 
} from './schemas/notification.schema';

export interface SendNotificationDto {
  userId: string;
  title: string;
  body: string;
  type?: NotificationType;
  data?: Record<string, any>;
}

export interface RegisterDeviceTokenDto {
  userId: string;
  token: string;
  platform: 'ios' | 'android';
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectModel(DeviceToken.name) 
    private deviceTokenModel: Model<DeviceTokenDocument>,
    @InjectModel(Notification.name) 
    private notificationModel: Model<NotificationDocument>,
    private firebaseService: FirebaseService,
  ) {}

  // Device token kaydetme
  async registerDeviceToken(dto: RegisterDeviceTokenDto): Promise<DeviceToken> {
    try {
      // Mevcut token'ı kontrol et
      const existingToken = await this.deviceTokenModel.findOne({
        userId: dto.userId,
        token: dto.token,
      });

      if (existingToken) {
        // Token varsa, aktif olarak işaretle ve lastUsed'ı güncelle
        existingToken.isActive = true;
        existingToken.lastUsed = new Date();
        existingToken.platform = dto.platform; // Platform güncellenmiş olabilir
        return await existingToken.save();
      }

      // Yeni token oluştur
      const deviceToken = new this.deviceTokenModel({
        userId: dto.userId,
        token: dto.token,
        platform: dto.platform,
        isActive: true,
        lastUsed: new Date(),
      });

      return await deviceToken.save();
    } catch (error) {
      this.logger.error('Error registering device token:', error);
      throw new BadRequestException('Device token kaydedilemedi');
    }
  }

  // Device token silme
  async unregisterDeviceToken(userId: string, token: string): Promise<void> {
    try {
      await this.deviceTokenModel.findOneAndUpdate(
        { userId, token },
        { isActive: false },
        { new: true }
      );

      this.logger.log(`Device token deactivated for user ${userId}`);
    } catch (error) {
      this.logger.error('Error unregistering device token:', error);
      throw new BadRequestException('Device token silinemedi');
    }
  }

  // Kullanıcının aktif device token'larını getir
  async getUserDeviceTokens(userId: string): Promise<DeviceToken[]> {
    return this.deviceTokenModel.find({
      userId,
      isActive: true,
    }).exec();
  }

  // Bildirim gönderme
  async sendNotification(dto: SendNotificationDto): Promise<{
    success: boolean;
    notificationId: string;
    sentCount: number;
    failureCount: number;
    errors?: string[];
  }> {
    try {
      // Firebase servis kontrolü
      if (!this.firebaseService.isInitialized()) {
        throw new Error('Firebase servis başlatılmamış');
      }

      // Kullanıcının device token'larını al
      const deviceTokens = await this.getUserDeviceTokens(dto.userId);

      if (deviceTokens.length === 0) {
        this.logger.warn(`No active device tokens found for user ${dto.userId}`);
        
        // Veritabanına bildirim kaydet (device yok olarak)
        const notification = new this.notificationModel({
          userId: dto.userId,
          title: dto.title,
          body: dto.body,
          type: dto.type || NotificationType.GENERAL,
          status: NotificationStatus.FAILED,
          data: dto.data || {},
          error: 'No active device tokens found',
        });
        
        const savedNotification = await notification.save();
        
        return {
          success: false,
          notificationId: savedNotification._id.toString(),
          sentCount: 0,
          failureCount: 0,
          errors: ['No active device tokens found for user'],
        };
      }

      // Bildirim veritabanına kaydet
      const notification = new this.notificationModel({
        userId: dto.userId,
        title: dto.title,
        body: dto.body,
        type: dto.type || NotificationType.GENERAL,
        status: NotificationStatus.SENT,
        data: dto.data || {},
      });

      const savedNotification = await notification.save();

      // FCM mesajını hazırla
      const tokens = deviceTokens.map(dt => dt.token);
      const messaging = this.firebaseService.getMessaging();

      const message = {
        notification: {
          title: dto.title,
          body: dto.body,
        },
        data: {
          ...dto.data,
          notificationId: savedNotification._id.toString(),
          type: dto.type || NotificationType.GENERAL,
        },
        tokens,
      };

      // FCM ile gönder
      const response = await messaging.sendEachForMulticast(message);

      this.logger.log(
        `Notification sent - Success: ${response.successCount}/${tokens.length}, ` +
        `Failures: ${response.failureCount}`
      );

      // Başarısız token'ları işle
      const errors: string[] = [];
      if (response.failureCount > 0) {
        for (let i = 0; i < response.responses.length; i++) {
          const res = response.responses[i];
          if (!res.success) {
            const token = tokens[i];
            const error = res.error;
            
            this.logger.error(`Failed to send to token ${token}:`, error);
            errors.push(`Token ${token}: ${error.message}`);

            // Geçersiz token'ları deaktive et
            if (
              error.code === 'messaging/invalid-registration-token' ||
              error.code === 'messaging/registration-token-not-registered'
            ) {
              await this.deviceTokenModel.findOneAndUpdate(
                { token },
                { isActive: false }
              );
              this.logger.log(`Deactivated invalid token: ${token}`);
            }
          }
        }
      }

      // Bildirim durumunu güncelle
      const updateData: any = {
        fcmResponse: {
          successCount: response.successCount,
          failureCount: response.failureCount,
        },
      };

      if (response.successCount > 0) {
        updateData.status = NotificationStatus.DELIVERED;
        updateData.deliveredAt = new Date();
      } else {
        updateData.status = NotificationStatus.FAILED;
        updateData.error = errors.join('; ');
      }

      await this.notificationModel.findByIdAndUpdate(
        savedNotification._id,
        updateData
      );

      return {
        success: response.successCount > 0,
        notificationId: savedNotification._id.toString(),
        sentCount: response.successCount,
        failureCount: response.failureCount,
        errors: errors.length > 0 ? errors : undefined,
      };

    } catch (error) {
      this.logger.error('Error sending notification:', error);
      throw new BadRequestException(`Bildirim gönderilemedi: ${error.message}`);
    }
  }

  // Kullanıcının bildirim geçmişini getir
  async getUserNotificationHistory(
    userId: string,
    page = 1,
    limit = 20
  ): Promise<{
    notifications: Notification[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;

      const [notifications, total] = await Promise.all([
        this.notificationModel
          .find({ userId })
          .sort({ sentAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.notificationModel.countDocuments({ userId }).exec(),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        notifications,
        total,
        page,
        totalPages,
      };
    } catch (error) {
      this.logger.error('Error fetching notification history:', error);
      throw new BadRequestException('Bildirim geçmişi alınamadı');
    }
  }

  // Bildirimi okundu olarak işaretle
  async markNotificationAsRead(notificationId: string, userId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const notification = await this.notificationModel.findOne({
        _id: notificationId,
        recipient: userId, // Sadece kendi bildirimlerini işaretleyebilir
      });

      if (!notification) {
        return {
          success: false,
          message: 'Bildirim bulunamadı',
        };
      }

      if (notification.status === NotificationStatus.READ) {
        return {
          success: true,
          message: 'Bildirim zaten okunmuş',
        };
      }

      notification.status = NotificationStatus.READ;
      notification.readAt = new Date();
      await notification.save();

      return {
        success: true,
        message: 'Bildirim okundu olarak işaretlendi',
      };
    } catch (error) {
      this.logger.error('Error marking notification as read:', error);
      throw new BadRequestException('Bildirim durumu güncellenemedi');
    }
  }

  // Okunmamış bildirim sayısını getir
  async getUnreadNotificationCount(userId: string): Promise<number> {
    try {
      return await this.notificationModel
        .countDocuments({
          userId,
          status: { $ne: NotificationStatus.READ },
        })
        .exec();
    } catch (error) {
      this.logger.error('Error getting unread notification count:', error);
      return 0;
    }
  }

  // Eski bildirimleri temizle (30 gün öncesi)
  async cleanupOldNotifications(): Promise<number> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await this.notificationModel.deleteMany({
        sentAt: { $lt: thirtyDaysAgo },
      });

      this.logger.log(`Cleaned up ${result.deletedCount} old notifications`);
      return result.deletedCount;
    } catch (error) {
      this.logger.error('Error cleaning up old notifications:', error);
      return 0;
    }
  }

  // Aktif olmayan device token'ları temizle
  async cleanupInactiveTokens(): Promise<number> {
    try {
      // 30 gün önce kullanılmamış token'ları sil
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await this.deviceTokenModel.deleteMany({
        $or: [
          { isActive: false },
          { lastUsed: { $lt: thirtyDaysAgo } },
        ],
      });

      this.logger.log(`Cleaned up ${result.deletedCount} inactive device tokens`);
      return result.deletedCount;
    } catch (error) {
      this.logger.error('Error cleaning up inactive tokens:', error);
      return 0;
    }
  }
}
