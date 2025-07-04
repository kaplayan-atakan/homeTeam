import { IsEmail, IsString, IsOptional, IsEnum, MinLength, IsPhoneNumber } from 'class-validator';
import { UserRole, UserStatus } from '../user.schema';

// SOLID: Single Responsibility Principle - Her DTO tek bir sorumluluğa sahip

export class CreateUserDto {
  @IsString({ message: 'Ad alanı gereklidir' })
  @MinLength(2, { message: 'Ad en az 2 karakter olmalıdır' })
  firstName: string;

  @IsString({ message: 'Soyad alanı gereklidir' })
  @MinLength(2, { message: 'Soyad en az 2 karakter olmalıdır' })
  lastName: string;

  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz' })
  email: string;

  @IsString({ message: 'Şifre gereklidir' })
  @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır' })
  password: string;

  @IsOptional()
  @IsString()
  profileImage?: string;

  @IsOptional()
  @IsPhoneNumber('TR', { message: 'Geçerli bir telefon numarası giriniz' })
  phoneNumber?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'Ad geçerli bir metin olmalıdır' })
  @MinLength(2, { message: 'Ad en az 2 karakter olmalıdır' })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'Soyad geçerli bir metin olmalıdır' })
  @MinLength(2, { message: 'Soyad en az 2 karakter olmalıdır' })
  lastName?: string;

  @IsOptional()
  @IsString()
  profileImage?: string;

  @IsOptional()
  @IsPhoneNumber('TR', { message: 'Geçerli bir telefon numarası giriniz' })
  phoneNumber?: string;
}

export class UpdateUserRoleDto {
  @IsEnum(UserRole, { message: 'Geçerli bir rol seçiniz' })
  role: UserRole;
}

export class UpdateUserStatusDto {
  @IsEnum(UserStatus, { message: 'Geçerli bir durum seçiniz' })
  status: UserStatus;
}

export class UpdateNotificationPreferencesDto {
  @IsOptional()
  email?: boolean;

  @IsOptional()
  push?: boolean;

  @IsOptional()
  sms?: boolean;

  @IsOptional()
  taskReminders?: boolean;

  @IsOptional()
  groupMessages?: boolean;
}
