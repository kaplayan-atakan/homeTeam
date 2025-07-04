import { 
  IsString, 
  IsOptional, 
  IsEnum, 
  IsNumber, 
  IsDate, 
  IsBoolean,
  IsArray,
  IsMongoId,
  Min,
  Max,
  MinLength 
} from 'class-validator';
import { Type } from 'class-transformer';
import { TaskStatus, TaskPriority, RecurrenceType } from '../task.schema';

// SOLID: Single Responsibility Principle - Her DTO belirli bir işlem için

export class CreateTaskDto {
  @IsString({ message: 'Görev başlığı gereklidir' })
  @MinLength(3, { message: 'Görev başlığı en az 3 karakter olmalıdır' })
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TaskPriority, { message: 'Geçerli bir öncelik seviyesi seçiniz' })
  priority?: TaskPriority;

  @IsOptional()
  @IsMongoId({ message: 'Geçerli bir kullanıcı ID giriniz' })
  assignedTo?: string;

  @IsOptional()
  @IsMongoId({ message: 'Geçerli bir grup ID giriniz' })
  groupId?: string;

  @IsOptional()
  @IsNumber({}, { message: 'SLA dakikası sayı olmalıdır' })
  @Min(1, { message: 'SLA en az 1 dakika olmalıdır' })
  @Max(43200, { message: 'SLA en fazla 43200 dakika (30 gün) olabilir' })
  slaMinutes?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Geçerli bir başlangıç tarihi giriniz' })
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Geçerli bir bitiş tarihi giriniz' })
  dueDate?: Date;

  @IsOptional()
  @IsEnum(RecurrenceType, { message: 'Geçerli bir tekrar türü seçiniz' })
  recurrenceType?: RecurrenceType;

  @IsOptional()
  recurrenceConfig?: {
    interval?: number;
    endDate?: Date;
    maxOccurrences?: number;
  };

  @IsOptional()
  musicSettings?: {
    playlistId?: string;
    provider?: 'spotify' | 'youtube';
    autoStart?: boolean;
    autoStop?: boolean;
  };

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  recurrenceInterval?: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumber()
  @Min(5, { message: 'Tahmini süre en az 5 dakika olmalıdır' })
  estimatedDuration?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  points?: number;

  @IsOptional()
  @IsBoolean()
  autoCreateNext?: boolean;
}

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Görev başlığı en az 3 karakter olmalıdır' })
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus, { message: 'Geçerli bir durum seçiniz' })
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority, { message: 'Geçerli bir öncelik seviyesi seçiniz' })
  priority?: TaskPriority;

  @IsOptional()
  @IsMongoId({ message: 'Geçerli bir kullanıcı ID giriniz' })
  assignedTo?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(720)
  slaHours?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dueDate?: Date;

  @IsOptional()
  @IsEnum(RecurrenceType)
  recurrence?: RecurrenceType;

  @IsOptional()
  @IsNumber()
  @Min(1)
  recurrenceInterval?: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumber()
  @Min(5)
  estimatedDuration?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  points?: number;

  @IsOptional()
  @IsBoolean()
  autoCreateNext?: boolean;

  @IsOptional()
  musicSettings?: {
    spotifyPlaylistId?: string;
    youtubePlaylistId?: string;
    autoPlay: boolean;
  };
}

export class AddCommentDto {
  @IsString({ message: 'Yorum metni gereklidir' })
  @MinLength(1, { message: 'Yorum boş olamaz' })
  comment: string;

  @IsString({ message: 'Yorum içeriği gereklidir' })
  @MinLength(1, { message: 'Yorum boş olamaz' })
  content: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @IsOptional()
  @IsMongoId()
  replyTo?: string;
}

export class TaskFilterDto {
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsMongoId()
  assignedTo?: string;

  @IsOptional()
  @IsMongoId()
  createdBy?: string;

  @IsOptional()
  @IsMongoId()
  groupId?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @IsOptional()
  @IsBoolean()
  overdue?: boolean;

  @IsOptional()
  @IsString()
  search?: string; // Başlık veya açıklama içinde arama

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dueDateFrom?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dueDateTo?: Date;

  @IsOptional()
  @IsBoolean()
  recurring?: boolean;

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
  sortBy?: string; // 'dueDate', 'createdAt', 'priority', 'title'

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}

export class TaskStatsDto {
  @IsOptional()
  @IsMongoId()
  groupId?: string;

  @IsOptional()
  @IsMongoId()
  userId?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @IsOptional()
  @IsBoolean()
  groupByStatus?: boolean;

  @IsOptional()
  @IsBoolean()
  groupByPriority?: boolean;

  @IsOptional()
  @IsBoolean()
  groupByUser?: boolean;
}

export class AssignTaskDto {
  @IsMongoId({ message: 'Geçerli bir kullanıcı ID giriniz' })
  assignedTo: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class CompleteTaskDto {
  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsString()
  completionNote?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  actualTime?: number; // Dakika cinsinden

  @IsOptional()
  @IsNumber()
  @Min(1)
  actualDuration?: number; // Dakika cinsinden
}

export class BulkUpdateTasksDto {
  @IsArray()
  @IsMongoId({ each: true })
  taskIds: string[];

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsMongoId()
  assignedTo?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dueDate?: Date;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class CreateSubtaskDto {
  @IsMongoId({ message: 'Geçerli bir ana görev ID giriniz' })
  parentTaskId: string;

  @IsString({ message: 'Alt görev başlığı gereklidir' })
  @MinLength(3, { message: 'Alt görev başlığı en az 3 karakter olmalıdır' })
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsMongoId({ message: 'Geçerli bir kullanıcı ID giriniz' })
  assignedTo?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(168) // Maksimum 1 hafta
  slaHours?: number;
}

export class TaskTemplateDto {
  @IsString({ message: 'Şablon adı gereklidir' })
  @MinLength(3, { message: 'Şablon adı en az 3 karakter olmalıdır' })
  name: string;

  @IsString({ message: 'Görev başlığı gereklidir' })
  @MinLength(3, { message: 'Görev başlığı en az 3 karakter olmalıdır' })
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(720)
  slaHours?: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumber()
  @Min(5)
  estimatedDuration?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  points?: number;

  @IsOptional()
  @IsEnum(RecurrenceType)
  recurrence?: RecurrenceType;

  @IsOptional()
  @IsNumber()
  @Min(1)
  recurrenceInterval?: number;

  @IsOptional()
  musicSettings?: {
    spotifyPlaylistId?: string;
    youtubePlaylistId?: string;
    autoPlay: boolean;
  };
}
