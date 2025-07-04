import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsObject,
  IsDate,
  IsMongoId,
  IsNumber,
  Min,
  Max,
  MinLength,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { NotificationType, NotificationPriority, NotificationStatus } from '../notification.schema';

// SOLID: Single Responsibility Principle - Her DTO tek bir işlem için

export class CreateNotificationDto {
  @IsMongoId({ message: 'Geçerli bir kullanıcı ID giriniz' })
  userId: string;

  @IsEnum(NotificationType, { message: 'Geçerli bir bildirim türü seçiniz' })
  type: NotificationType;

  @IsString({ message: 'Başlık gereklidir' })
  @MinLength(3, { message: 'Başlık en az 3 karakter olmalıdır' })
  @MaxLength(100, { message: 'Başlık en fazla 100 karakter olabilir' })
  title: string;

  @IsString({ message: 'Mesaj gereklidir' })
  @MinLength(10, { message: 'Mesaj en az 10 karakter olmalıdır' })
  @MaxLength(500, { message: 'Mesaj en fazla 500 karakter olabilir' })
  message: string;

  @IsOptional()
  @IsObject()
  data?: {
    taskId?: string;
    groupId?: string;
    userId?: string;
    message?: string;
    url?: string;
    metadata?: Record<string, any>;
  };

  @IsOptional()
  @IsEnum(NotificationPriority, { message: 'Geçerli bir öncelik seviyesi seçiniz' })
  priority?: NotificationPriority;

  @IsOptional()
  @IsMongoId({ message: 'Geçerli bir kullanıcı ID giriniz' })
  triggeredBy?: string;

  @IsOptional()
  @IsMongoId({ message: 'Geçerli bir grup ID giriniz' })
  groupId?: string;

  @IsOptional()
  @IsMongoId({ message: 'Geçerli bir görev ID giriniz' })
  taskId?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Geçerli bir tarih giriniz' })
  scheduledFor?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Geçerli bir tarih giriniz' })
  expiresAt?: Date;

  @IsOptional()
  @IsBoolean()
  isPush?: boolean;

  @IsOptional()
  @IsBoolean()
  isEmail?: boolean;

  @IsOptional()
  @IsBoolean()
  isSMS?: boolean;

  @IsOptional()
  @IsBoolean()
  isInApp?: boolean;

  @IsOptional()
  @IsObject()
  pushNotificationData?: {
    sound?: string;
    badge?: number;
    category?: string;
    data?: Record<string, any>;
  };

  @IsOptional()
  @IsObject()
  emailData?: {
    subject?: string;
    template?: string;
    templateData?: Record<string, any>;
  };
}

export class BulkCreateNotificationDto {
  @IsMongoId({ message: 'Geçerli kullanıcı ID\'leri giriniz' }, { each: true })
  userIds: string[];

  @IsEnum(NotificationType, { message: 'Geçerli bir bildirim türü seçiniz' })
  type: NotificationType;

  @IsString({ message: 'Başlık gereklidir' })
  @MinLength(3, { message: 'Başlık en az 3 karakter olmalıdır' })
  @MaxLength(100, { message: 'Başlık en fazla 100 karakter olabilir' })
  title: string;

  @IsString({ message: 'Mesaj gereklidir' })
  @MinLength(10, { message: 'Mesaj en az 10 karakter olmalıdır' })
  @MaxLength(500, { message: 'Mesaj en fazla 500 karakter olabilir' })
  message: string;

  @IsOptional()
  @IsObject()
  data?: {
    taskId?: string;
    groupId?: string;
    userId?: string;
    message?: string;
    url?: string;
    metadata?: Record<string, any>;
  };

  @IsOptional()
  @IsEnum(NotificationPriority, { message: 'Geçerli bir öncelik seviyesi seçiniz' })
  priority?: NotificationPriority;

  @IsOptional()
  @IsMongoId({ message: 'Geçerli bir kullanıcı ID giriniz' })
  triggeredBy?: string;

  @IsOptional()
  @IsMongoId({ message: 'Geçerli bir grup ID giriniz' })
  groupId?: string;

  @IsOptional()
  @IsMongoId({ message: 'Geçerli bir görev ID giriniz' })
  taskId?: string;
}

export class UpdateNotificationDto {
  @IsOptional()
  @IsEnum(NotificationStatus, { message: 'Geçerli bir durum seçiniz' })
  status?: NotificationStatus;

  @IsOptional()
  @IsEnum(NotificationPriority, { message: 'Geçerli bir öncelik seviyesi seçiniz' })
  priority?: NotificationPriority;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Geçerli bir tarih giriniz' })
  scheduledFor?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Geçerli bir tarih giriniz' })
  expiresAt?: Date;
}

export class NotificationFilterDto {
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @IsOptional()
  @IsEnum(NotificationStatus)
  status?: NotificationStatus;

  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @IsOptional()
  @IsMongoId()
  groupId?: string;

  @IsOptional()
  @IsMongoId()
  taskId?: string;

  @IsOptional()
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  endDate?: Date;

  @IsOptional()
  @IsBoolean()
  unreadOnly?: boolean; // Sadece okunmamış bildirimleri getir

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsString()
  sortBy?: string; // 'createdAt', 'priority', 'type'

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}

export class MarkAsReadDto {
  @IsMongoId({ message: 'Geçerli bildirim ID\'leri giriniz' }, { each: true })
  notificationIds: string[];
}

export class MarkAllAsReadDto {
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType; // Belirli türdeki tüm bildirimleri okundu işaretle

  @IsOptional()
  @IsMongoId()
  groupId?: string; // Belirli grubun tüm bildirimlerini okundu işaretle
}

export class NotificationSettingsDto {
  @IsOptional()
  @IsBoolean()
  enablePush?: boolean;

  @IsOptional()
  @IsBoolean()
  enableEmail?: boolean;

  @IsOptional()
  @IsBoolean()
  enableSMS?: boolean;

  @IsOptional()
  @IsBoolean()
  enableInApp?: boolean;

  @IsOptional()
  @IsObject()
  typeSettings?: {
    [key in NotificationType]?: {
      enabled: boolean;
      methods: ('push' | 'email' | 'sms' | 'inApp')[];
    };
  };

  @IsOptional()
  @IsObject()
  quietHours?: {
    enabled: boolean;
    startTime: string; // "22:00"
    endTime: string;   // "08:00"
    timezone: string;
  };

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(60)
  batchingInterval?: number; // Dakika cinsinden toplu gönderim aralığı
}

export class ScheduleNotificationDto extends CreateNotificationDto {
  @Type(() => Date)
  @IsDate({ message: 'Geçerli bir tarih giriniz' })
  scheduledFor: Date;
}

export class NotificationStatsDto {
  @IsOptional()
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  endDate?: Date;

  @IsOptional()
  @IsMongoId()
  groupId?: string;

  @IsOptional()
  @IsBoolean()
  byType?: boolean; // Türlere göre grupla

  @IsOptional()
  @IsBoolean()
  byStatus?: boolean; // Durumlara göre grupla
}
