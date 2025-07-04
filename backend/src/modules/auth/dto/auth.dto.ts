import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz' })
  email: string;

  @IsString({ message: 'Şifre gereklidir' })
  @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır' })
  password: string;
}

export class RegisterDto {
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
}

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz' })
  email: string;
}

export class ResetPasswordDto {
  @IsString({ message: 'Reset token gereklidir' })
  token: string;

  @IsString({ message: 'Yeni şifre gereklidir' })
  @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır' })
  newPassword: string;
}
