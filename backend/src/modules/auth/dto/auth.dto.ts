import { IsEmail, IsString, MinLength, MaxLength, Matches, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginDto {
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz' })
  @IsNotEmpty({ message: 'Email gereklidir' })
  @MaxLength(254, { message: 'Email en fazla 254 karakter olabilir' })
  @Transform(({ value }) => value?.toLowerCase()?.trim())
  email: string;

  @IsString({ message: 'Şifre bir metin olmalıdır' })
  @IsNotEmpty({ message: 'Şifre gereklidir' })
  @MaxLength(128, { message: 'Şifre en fazla 128 karakter olabilir' })
  password: string;
}

export class RegisterDto {
  @IsString({ message: 'Ad bir metin olmalıdır' })
  @IsNotEmpty({ message: 'Ad gereklidir' })
  @MinLength(2, { message: 'Ad en az 2 karakter olmalıdır' })
  @MaxLength(50, { message: 'Ad en fazla 50 karakter olabilir' })
  @Transform(({ value }) => value?.trim())
  firstName: string;

  @IsString({ message: 'Soyad bir metin olmalıdır' })
  @IsNotEmpty({ message: 'Soyad gereklidir' })
  @MinLength(2, { message: 'Soyad en az 2 karakter olmalıdır' })
  @MaxLength(50, { message: 'Soyad en fazla 50 karakter olabilir' })
  @Transform(({ value }) => value?.trim())
  lastName: string;

  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz' })
  @IsNotEmpty({ message: 'Email gereklidir' })
  @MaxLength(254, { message: 'Email en fazla 254 karakter olabilir' })
  @Transform(({ value }) => value?.toLowerCase()?.trim())
  email: string;

  @IsString({ message: 'Şifre bir metin olmalıdır' })
  @IsNotEmpty({ message: 'Şifre gereklidir' })
  @MinLength(8, { message: 'Şifre en az 8 karakter olmalıdır' })
  @MaxLength(128, { message: 'Şifre en fazla 128 karakter olabilir' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    { message: 'Şifre büyük harf, küçük harf, rakam ve özel karakter içermelidir' }
  )
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
