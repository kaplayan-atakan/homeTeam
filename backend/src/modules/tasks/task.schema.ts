import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TaskDocument = Task & Document;

export enum TaskStatus {
  PENDING = 'pending',      // Bekliyor
  IN_PROGRESS = 'in_progress', // Devam ediyor
  COMPLETED = 'completed',  // Tamamlandı
  OVERDUE = 'overdue',     // Süresi geçti
  CANCELLED = 'cancelled',  // İptal edildi
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum RecurrenceType {
  NONE = 'none',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ 
    type: String, 
    enum: TaskStatus, 
    default: TaskStatus.PENDING 
  })
  status: TaskStatus;

  @Prop({ 
    type: String, 
    enum: TaskPriority, 
    default: TaskPriority.MEDIUM 
  })
  priority: TaskPriority;

  // Atanan kullanıcı
  @Prop({ 
    type: Types.ObjectId, 
    ref: 'User', 
    required: true 
  })
  assignedTo: Types.ObjectId;

  // Görevi oluşturan kullanıcı
  @Prop({ 
    type: Types.ObjectId, 
    ref: 'User', 
    required: true 
  })
  createdBy: Types.ObjectId;

  // Grup (hangi gruba ait)
  @Prop({ 
    type: Types.ObjectId, 
    ref: 'Group', 
    required: false 
  })
  groupId?: Types.ObjectId;

  // SLA (Service Level Agreement) - Kaç dakika içinde tamamlanmalı
  @Prop({ required: false, min: 1 })
  slaMinutes?: number;

  // Başlangıç ve bitiş tarihleri
  @Prop({ default: new Date() })
  startDate: Date;

  @Prop({ required: true })
  dueDate: Date;

  @Prop({ default: null })
  completedAt?: Date;

  // Tamamlayan kullanıcı
  @Prop({ 
    type: Types.ObjectId, 
    ref: 'User', 
    required: false 
  })
  completedBy?: Types.ObjectId;

  // Tamamlama notu
  @Prop({ default: null })
  completionNote?: string;

  // Gerçekte geçen süre (dakika)
  @Prop({ default: null })
  actualTime?: number;

  // Tekrarlanan görev ayarları
  @Prop({ 
    type: String, 
    enum: RecurrenceType, 
    default: RecurrenceType.NONE 
  })
  recurrenceType: RecurrenceType;

  @Prop({ type: Object, default: null })
  recurrenceConfig?: {
    interval?: number;
    endDate?: Date;
    maxOccurrences?: number;
  };

  @Prop({ default: null })
  parentTaskId?: Types.ObjectId; // Tekrarlanan görevlerin ana görevi

  // SLA deadline
  @Prop({ default: null })
  slaDeadline?: Date;

  // Görev etiketleri
  @Prop({ 
    type: [String], 
    default: [] 
  })
  tags: string[];

  // Alt görevler
  @Prop({ 
    type: [Types.ObjectId], 
    ref: 'Task',
    default: [] 
  })
  subtasks: Types.ObjectId[];

  // Aktivite logu
  @Prop({ 
    type: [{ 
      action: String,
      userId: { type: Types.ObjectId, ref: 'User' },
      timestamp: { type: Date, default: Date.now },
      details: Object
    }],
    default: [] 
  })
  activityLog: Array<{
    action: string;
    userId: Types.ObjectId;
    timestamp: Date;
    details?: any;
  }>;

  // Müzik entegrasyonu
  @Prop({ 
    type: Object, 
    default: null 
  })
  musicSettings?: {
    playlistId?: string;
    provider?: 'spotify' | 'youtube';
    autoStart?: boolean;
    autoStop?: boolean;
  };

  // Görev kategorisi (ev işleri tipi)
  @Prop({ 
    type: String,
    enum: [
      'cleaning',     // Temizlik
      'cooking',      // Yemek
      'shopping',     // Alışveriş
      'maintenance',  // Bakım
      'organization', // Organizasyon
      'childcare',    // Çocuk bakımı
      'petcare',      // Evcil hayvan bakımı
      'garden',       // Bahçe işleri
      'other'         // Diğer
    ],
    default: 'other'
  })
  category: string;

  // Tahmini süre (dakika)
  @Prop({ min: 1 })
  estimatedDuration?: number;

  // Görev notları ve yorumlar
  @Prop({ 
    type: [{ 
      userId: { type: Types.ObjectId, ref: 'User' },
      comment: String,
      createdAt: { type: Date, default: Date.now }
    }],
    default: [] 
  })
  comments: Array<{
    userId: Types.ObjectId;
    comment: string;
    createdAt: Date;
  }>;

  // Görev ekleri (fotoğraf vs.)
  @Prop({ 
    type: [String], 
    default: [] 
  })
  attachments: string[];

  // Görev puanı (gamification için)
  @Prop({ default: 10, min: 1, max: 100 })
  points: number;

  // Görev tamamlandığında otomatik olarak yeni görev oluştur
  @Prop({ default: false })
  autoCreateNext: boolean;

  // SLA uyarı gönderildi mi?
  @Prop({ default: false })
  slaWarningsSent: boolean;

  // Görev aktif mi?
  @Prop({ default: true })
  isActive: boolean;

  // Oluşturulma ve güncellenme tarihleri
  createdAt?: Date;
  updatedAt?: Date;
}

export const TaskSchema = SchemaFactory.createForClass(Task);

// Index'ler - performans için
TaskSchema.index({ assignedTo: 1, status: 1 });
TaskSchema.index({ groupId: 1, dueDate: 1 });
TaskSchema.index({ status: 1, dueDate: 1 });
TaskSchema.index({ createdBy: 1 });
