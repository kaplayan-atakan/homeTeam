import { 
  IsString, 
  IsOptional, 
  IsEnum, 
  IsNumber, 
  IsBoolean,
  IsEmail,
  IsArray,
  IsMongoId,
  IsObject,
  Min,
  Max,
  MinLength,
  MaxLength,
  ValidateNested,
  IsHexColor
} from 'class-validator';
import { Type } from 'class-transformer';
import { GroupType, MemberRole } from '../group.schema';

// SOLID: Single Responsibility Principle - Her DTO tek bir işlem için

export class CreateGroupDto {
  @IsString({ message: 'Grup adı gereklidir' })
  @MinLength(3, { message: 'Grup adı en az 3 karakter olmalıdır' })
  @MaxLength(50, { message: 'Grup adı en fazla 50 karakter olabilir' })
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Açıklama en fazla 200 karakter olabilir' })
  description?: string;

  @IsOptional()
  @IsEnum(GroupType, { message: 'Geçerli bir grup türü seçiniz' })
  type?: GroupType;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsHexColor({ message: 'Geçerli bir hex renk kodu giriniz' })
  colorTheme?: string;

  @IsOptional()
  @IsObject()
  settings?: {
    isPublic?: boolean;
    requireApproval?: boolean;
    allowSelfJoin?: boolean;
    maxMembers?: number;
    defaultTaskSLA?: number;
    enableNotifications?: boolean;
    enableMusicIntegration?: boolean;
  };
}

export class UpdateGroupDto {
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Grup adı en az 3 karakter olmalıdır' })
  @MaxLength(50, { message: 'Grup adı en fazla 50 karakter olabilir' })
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Açıklama en fazla 200 karakter olabilir' })
  description?: string;

  @IsOptional()
  @IsEnum(GroupType, { message: 'Geçerli bir grup türü seçiniz' })
  type?: GroupType;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsHexColor({ message: 'Geçerli bir hex renk kodu giriniz' })
  colorTheme?: string;

  @IsOptional()
  @IsObject()
  settings?: {
    isPublic?: boolean;
    requireApproval?: boolean;
    allowSelfJoin?: boolean;
    maxMembers?: number;
    defaultTaskSLA?: number;
    enableNotifications?: boolean;
    enableMusicIntegration?: boolean;
  };
}

export class InviteMemberDto {
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz' })
  email: string;

  @IsOptional()
  @IsEnum(MemberRole, { message: 'Geçerli bir rol seçiniz' })
  role?: MemberRole;

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Davet mesajı en fazla 200 karakter olabilir' })
  message?: string;
}

export class InviteMultipleMembersDto {
  @IsArray({ message: 'E-posta listesi bir dizi olmalıdır' })
  @IsEmail({}, { each: true, message: 'Tüm e-posta adresleri geçerli olmalıdır' })
  emails: string[];

  @IsOptional()
  @IsEnum(MemberRole, { message: 'Geçerli bir rol seçiniz' })
  role?: MemberRole;

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Davet mesajı en fazla 200 karakter olabilir' })
  message?: string;
}

export class UpdateMemberRoleDto {
  @IsMongoId({ message: 'Geçerli bir kullanıcı ID giriniz' })
  userId: string;

  @IsEnum(MemberRole, { message: 'Geçerli bir rol seçiniz' })
  role: MemberRole;
}

export class UpdateMemberPermissionsDto {
  @IsMongoId({ message: 'Geçerli bir kullanıcı ID giriniz' })
  userId: string;

  @IsObject()
  permissions: {
    canCreateTasks?: boolean;
    canAssignTasks?: boolean;
    canDeleteTasks?: boolean;
    canInviteMembers?: boolean;
    canRemoveMembers?: boolean;
    canManageGroup?: boolean;
  };
}

export class RemoveMemberDto {
  @IsMongoId({ message: 'Geçerli bir kullanıcı ID giriniz' })
  userId: string;

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Sebep en fazla 200 karakter olabilir' })
  reason?: string;
}

export class JoinGroupDto {
  @IsString({ message: 'Davet kodu gereklidir' })
  inviteCode: string;
}

export class AddMemberDto {
  @IsMongoId({ message: 'Geçerli bir kullanıcı ID giriniz' })
  userId: string;

  @IsOptional()
  @IsEnum(MemberRole, { message: 'Geçerli bir rol seçiniz' })
  role?: MemberRole = MemberRole.MEMBER;
}

export class LeaveGroupDto {
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Sebep en fazla 200 karakter olabilir' })
  reason?: string;
}

export class GroupFilterDto {
  @IsOptional()
  @IsEnum(GroupType)
  type?: GroupType;

  @IsOptional()
  @IsString()
  search?: string; // Grup adı veya açıklama içinde arama

  @IsOptional()
  @IsBoolean()
  isOwner?: boolean; // Sadece sahip olduğum gruplar

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean; // Sadece herkese açık gruplar

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
  sortBy?: string; // 'name', 'createdAt', 'memberCount', 'taskCount'

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}

export class GroupStatsDto {
  @IsOptional()
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  endDate?: Date;

  @IsOptional()
  @IsBoolean()
  includeArchivedGroups?: boolean;
}

export class ArchiveGroupDto {
  @IsString({ message: 'Arşiv sebebi gereklidir' })
  @MinLength(10, { message: 'Arşiv sebebi en az 10 karakter olmalıdır' })
  @MaxLength(200, { message: 'Arşiv sebebi en fazla 200 karakter olabilir' })
  reason: string;
}

export class TransferOwnershipDto {
  @IsMongoId({ message: 'Geçerli bir kullanıcı ID giriniz' })
  newOwnerId: string;

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Not en fazla 200 karakter olabilir' })
  note?: string;
}

export class GroupActivityFilterDto {
  @IsOptional()
  @IsString()
  action?: string; // Belirli bir aktivite türü

  @IsOptional()
  @IsMongoId()
  userId?: string; // Belirli bir kullanıcının aktiviteleri

  @IsOptional()
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  endDate?: Date;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}
