import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

export enum NotificationStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

export enum NotificationType {
  TASK_ASSIGNED = 'task_assigned',
  TASK_DUE_SOON = 'task_due_soon',
  TASK_OVERDUE = 'task_overdue',
  TASK_COMPLETED = 'task_completed',
  COMMENT_ADDED = 'comment_added',
  GROUP_INVITE = 'group_invite',
  GENERAL = 'general',
}

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  body: string;

  @Prop({
    type: String,
    enum: NotificationType,
    default: NotificationType.GENERAL,
  })
  type: NotificationType;

  @Prop({
    type: String,
    enum: NotificationStatus,
    default: NotificationStatus.SENT,
  })
  status: NotificationStatus;

  @Prop({ 
    type: Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  })
  userId: Types.ObjectId;

  @Prop({ type: Object, default: {} })
  data: Record<string, any>;

  @Prop({ default: new Date() })
  sentAt: Date;

  @Prop({ default: null })
  readAt: Date;

  @Prop({ default: null })
  deliveredAt: Date;

  // FCM response bilgileri
  @Prop({ type: Object, default: null })
  fcmResponse: Record<string, any>;

  // Hata bilgileri
  @Prop({ default: null })
  error: string;

  // Yeniden deneme sayısı
  @Prop({ default: 0 })
  retryCount: number;

  // Timestamps (createdAt, updatedAt) otomatik eklenir
  createdAt?: Date;
  updatedAt?: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// User'a göre arama ve sıralama için index
NotificationSchema.index({ userId: 1, sentAt: -1 });

// Status'a göre arama için index
NotificationSchema.index({ status: 1 });

// Type'a göre arama için index
NotificationSchema.index({ type: 1 });

// Eski bildirimleri temizlemek için index
NotificationSchema.index({ sentAt: 1 });
