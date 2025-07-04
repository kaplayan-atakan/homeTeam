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

  @IsMongoId({ message: 'Geçerli bir kullanıcı ID giriniz' })
  assignedTo: string;

  @IsMongoId({ message: 'Geçerli bir grup ID giriniz' })
  group: string;

  @IsNumber({}, { message: 'SLA saati sayı olmalıdır' })
  @Min(1, { message: 'SLA en az 1 saat olmalıdır' })
  @Max(720, { message: 'SLA en fazla 720 saat (30 gün) olabilir' })
  slaHours: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Geçerli bir başlangıç tarihi giriniz' })
  startDate?: Date;

  @Type(() => Date)
  @IsDate({ message: 'Geçerli bir bitiş tarihi giriniz' })
  dueDate: Date;

  @IsOptional()
  @IsEnum(RecurrenceType, { message: 'Geçerli bir tekrar türü seçiniz' })
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

  @IsOptional()
  musicSettings?: {
    spotifyPlaylistId?: string;
    youtubePlaylistId?: string;
    autoPlay: boolean;
  };
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
  group?: string;

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
}
