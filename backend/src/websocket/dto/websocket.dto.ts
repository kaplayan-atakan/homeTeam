import {
  IsString,
  IsOptional,
  IsEnum,
  IsObject,
  IsArray,
  IsMongoId,
  MinLength,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// WebSocket mesaj türleri
export enum RoomType {
  GROUP = 'group',
  TASK = 'task',
  DIRECT = 'direct',
  SYSTEM = 'system',
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  AUDIO = 'audio',
  LOCATION = 'location',
  SYSTEM = 'system',
}

export enum TaskAction {
  CREATED = 'created',
  UPDATED = 'updated',
  COMPLETED = 'completed',
  ASSIGNED = 'assigned',
  COMMENTED = 'commented',
  STATUS_CHANGED = 'status_changed',
  DUE_DATE_CHANGED = 'due_date_changed',
}

export enum MusicAction {
  PLAY = 'play',
  PAUSE = 'pause',
  STOP = 'stop',
  NEXT = 'next',
  PREVIOUS = 'previous',
  SHUFFLE = 'shuffle',
  REPEAT = 'repeat',
  VOLUME_CHANGE = 'volume_change',
}

// DTO'lar
export class JoinRoomDto {
  @IsString({ message: 'Oda ID gereklidir' })
  roomId: string;

  @IsEnum(RoomType, { message: 'Geçerli bir oda türü seçiniz' })
  roomType: RoomType;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class LeaveRoomDto {
  @IsString({ message: 'Oda ID gereklidir' })
  roomId: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class SendMessageDto {
  @IsString({ message: 'Oda ID gereklidir' })
  roomId: string;

  @IsString({ message: 'Mesaj içeriği gereklidir' })
  @MinLength(1, { message: 'Mesaj boş olamaz' })
  @MaxLength(1000, { message: 'Mesaj en fazla 1000 karakter olabilir' })
  content: string;

  @IsOptional()
  @IsEnum(MessageType, { message: 'Geçerli bir mesaj türü seçiniz' })
  type?: MessageType = MessageType.TEXT;

  @IsOptional()
  @IsObject()
  metadata?: {
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    coordinates?: { lat: number; lng: number };
    replyTo?: string; // Yanıtlanan mesaj ID'si
    mentions?: string[]; // Mention edilen kullanıcı ID'leri
  };
}

export class TaskUpdateDto {
  @IsMongoId({ message: 'Geçerli bir görev ID giriniz' })
  taskId: string;

  @IsEnum(TaskAction, { message: 'Geçerli bir görev aksiyonu seçiniz' })
  action: TaskAction;

  @IsOptional()
  @IsMongoId({ message: 'Geçerli bir grup ID giriniz' })
  groupId?: string;

  @IsOptional()
  @IsObject()
  updates?: {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    dueDate?: Date;
    assignedTo?: string;
    completedAt?: Date;
  };

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true, message: 'Geçerli kullanıcı ID\'leri giriniz' })
  affectedUsers?: string[]; // Bildirim gönderilecek kullanıcılar

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Yorum en fazla 500 karakter olabilir' })
  comment?: string;
}

export class MusicControlDto {
  @IsEnum(MusicAction, { message: 'Geçerli bir müzik aksiyonu seçiniz' })
  action: MusicAction;

  @IsOptional()
  @IsMongoId({ message: 'Geçerli bir grup ID giriniz' })
  groupId?: string;

  @IsOptional()
  @IsObject()
  playlist?: {
    id: string;
    name: string;
    provider: string;
  };

  @IsOptional()
  @IsObject()
  track?: {
    id: string;
    title: string;
    artist: string;
    duration: number;
  };

  @IsOptional()
  @IsObject()
  settings?: {
    volume?: number;
    shuffle?: boolean;
    repeat?: boolean;
    position?: number; // Şarkıdaki pozisyon (saniye)
  };
}

export class NotificationEventDto {
  @IsMongoId({ message: 'Geçerli bir kullanıcı ID giriniz' })
  userId: string;

  @IsString({ message: 'Bildirim türü gereklidir' })
  type: string;

  @IsString({ message: 'Başlık gereklidir' })
  title: string;

  @IsString({ message: 'Mesaj gereklidir' })
  message: string;

  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @IsOptional()
  @IsString()
  priority?: string;
}

export class TypingIndicatorDto {
  @IsString({ message: 'Oda ID gereklidir' })
  roomId: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Yazılan metin çok uzun' })
  previewText?: string; // Kullanıcının yazdığı metnin önizlemesi
}

export class UserStatusDto {
  @IsEnum(['online', 'away', 'busy', 'offline'], { 
    message: 'Geçerli bir durum seçiniz' 
  })
  status: 'online' | 'away' | 'busy' | 'offline';

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Durum mesajı en fazla 100 karakter olabilir' })
  statusMessage?: string;

  @IsOptional()
  @IsObject()
  metadata?: {
    lastActiveAt?: Date;
    currentActivity?: string;
    location?: string;
  };
}

export class GroupActivityDto {
  @IsMongoId({ message: 'Geçerli bir grup ID giriniz' })
  groupId: string;

  @IsString({ message: 'Aktivite türü gereklidir' })
  activityType: string;

  @IsObject()
  activityData: {
    action: string;
    targetId?: string;
    targetType?: string;
    description: string;
    metadata?: Record<string, any>;
  };
}

export class SystemAnnouncementDto {
  @IsString({ message: 'Duyuru başlığı gereklidir' })
  @MinLength(5, { message: 'Başlık en az 5 karakter olmalıdır' })
  @MaxLength(100, { message: 'Başlık en fazla 100 karakter olabilir' })
  title: string;

  @IsString({ message: 'Duyuru mesajı gereklidir' })
  @MinLength(10, { message: 'Mesaj en az 10 karakter olmalıdır' })
  @MaxLength(500, { message: 'Mesaj en fazla 500 karakter olabilir' })
  message: string;

  @IsOptional()
  @IsEnum(['info', 'warning', 'error', 'success'], { 
    message: 'Geçerli bir tip seçiniz' 
  })
  type?: 'info' | 'warning' | 'error' | 'success';

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true, message: 'Geçerli kullanıcı ID\'leri giriniz' })
  targetUsers?: string[]; // Belirli kullanıcılara gönderim

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true, message: 'Geçerli grup ID\'leri giriniz' })
  targetGroups?: string[]; // Belirli gruplara gönderim

  @IsOptional()
  @IsObject()
  metadata?: {
    url?: string;
    actionText?: string;
    expiresAt?: Date;
    priority?: number;
  };
}

export class VoiceCallDto {
  @IsString({ message: 'Oda ID gereklidir' })
  roomId: string;

  @IsEnum(['start', 'join', 'leave', 'end'], { 
    message: 'Geçerli bir çağrı aksiyonu seçiniz' 
  })
  action: 'start' | 'join' | 'leave' | 'end';

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true, message: 'Geçerli kullanıcı ID\'leri giriniz' })
  participants?: string[];

  @IsOptional()
  @IsObject()
  callSettings?: {
    audioOnly?: boolean;
    recordCall?: boolean;
    maxParticipants?: number;
  };
}

export class ScreenShareDto {
  @IsString({ message: 'Oda ID gereklidir' })
  roomId: string;

  @IsEnum(['start', 'stop'], { 
    message: 'Geçerli bir paylaşım aksiyonu seçiniz' 
  })
  action: 'start' | 'stop';

  @IsOptional()
  @IsObject()
  shareSettings?: {
    quality?: 'low' | 'medium' | 'high';
    includeAudio?: boolean;
    shareType?: 'screen' | 'window' | 'tab';
  };
}
