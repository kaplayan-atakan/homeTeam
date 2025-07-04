import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

export enum NotificationType {
  TASK_ASSIGNED = 'task_assigned',
  TASK_DUE_SOON = 'task_due_soon',
  TASK_OVERDUE = 'task_overdue',
  TASK_COMPLETED = 'task_completed',
  TASK_COMMENT = 'task_comment',
  GROUP_INVITE = 'group_invite',
  GROUP_JOINED = 'group_joined',
  GROUP_LEFT = 'group_left',
  MEMBER_ADDED = 'member_added',
  MEMBER_REMOVED = 'member_removed',
  ROLE_CHANGED = 'role_changed',
  SLA_WARNING = 'sla_warning',
  ACHIEVEMENT_EARNED = 'achievement_earned',
  MUSIC_STARTED = 'music_started',
  SYSTEM_UPDATE = 'system_update',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  READ = 'read',
  ARCHIVED = 'archived',
}

export interface NotificationData {
  taskId?: string;
  groupId?: string;
  userId?: string;
  message?: string;
  url?: string;
  assignedBy?: string;
  timeLeft?: number;
  inviteToken?: string;
  metadata?: Record<string, any>;
}

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId; // Bildirimi alacak kullanıcı

  @Prop({ required: true, enum: NotificationType })
  type: NotificationType;

  @Prop({ required: true, trim: true, maxlength: 100 })
  title: string;

  @Prop({ required: true, trim: true, maxlength: 500 })
  message: string;

  @Prop({ 
    type: Object,
    default: {}
  })
  data: NotificationData; // Ek veriler

  @Prop({ 
    enum: NotificationPriority, 
    default: NotificationPriority.MEDIUM 
  })
  priority: NotificationPriority;

  @Prop({ 
    enum: NotificationStatus, 
    default: NotificationStatus.PENDING 
  })
  status: NotificationStatus;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  triggeredBy?: Types.ObjectId; // Bildirimi tetikleyen kullanıcı

  @Prop({ type: Types.ObjectId, ref: 'Group' })
  groupId?: Types.ObjectId; // İlgili grup

  @Prop({ type: Types.ObjectId, ref: 'Task' })
  taskId?: Types.ObjectId; // İlgili görev

  @Prop()
  readAt?: Date; // Okunma tarihi

  @Prop()
  sentAt?: Date; // Gönderilme tarihi

  @Prop()
  scheduledFor?: Date; // Zamanlanmış gönderim

  @Prop({ default: false })
  isPush: boolean; // Push notification gönderilsin mi?

  @Prop({ default: false })
  isEmail: boolean; // E-posta gönderilsin mi?

  @Prop({ default: false })
  isSMS: boolean; // SMS gönderilsin mi?

  @Prop({ default: false })
  isInApp: boolean; // Uygulama içi bildirim

  @Prop()
  expiresAt?: Date; // Bildirim son geçerlilik tarihi

  @Prop({ type: Object })
  pushNotificationData?: {
    sound?: string;
    badge?: number;
    category?: string;
    data?: Record<string, any>;
  };

  @Prop({ type: Object })
  emailData?: {
    subject?: string;
    template?: string;
    templateData?: Record<string, any>;
  };

  // Bildirimi okundu olarak işaretle
  markAsRead(): void {
    this.status = NotificationStatus.READ;
    this.readAt = new Date();
  }

  // Bildirim süresi dolmuş mu?
  isExpired(): boolean {
    return this.expiresAt ? new Date() > this.expiresAt : false;
  }

  // Gönderilmeyi bekliyor mu?
  isPending(): boolean {
    return this.status === NotificationStatus.PENDING;
  }

  // Zamanlanmış bildirim zamanı geldi mi?
  isTimeToSend(): boolean {
    if (!this.scheduledFor) return true;
    return new Date() >= this.scheduledFor;
  }
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Index'ler
NotificationSchema.index({ userId: 1, status: 1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ createdAt: -1 });
NotificationSchema.index({ scheduledFor: 1 });
NotificationSchema.index({ expiresAt: 1 });

// Metodları schema'ya ekle
NotificationSchema.methods.markAsRead = function() {
  this.status = NotificationStatus.READ;
  this.readAt = new Date();
};

NotificationSchema.methods.isExpired = function() {
  return this.expiresAt ? new Date() > this.expiresAt : false;
};

NotificationSchema.methods.isPending = function() {
  return this.status === NotificationStatus.PENDING;
};

NotificationSchema.methods.isTimeToSend = function() {
  if (!this.scheduledFor) return true;
  return new Date() >= this.scheduledFor;
};
