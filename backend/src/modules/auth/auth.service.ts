import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { User } from '../users/user.schema';
import * as bcrypt from 'bcryptjs';

// SOLID: Single Responsibility Principle - Kimlik doğrulama işlemleri
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // Kullanıcı kaydı
  async register(registerDto: RegisterDto): Promise<{
    user: User;
    accessToken: string;
  }> {
    try {
      const user = await this.usersService.create(registerDto);
      const accessToken = await this.generateAccessToken(user);

      return {
        user,
        accessToken,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new Error('Kayıt işlemi başarısız');
    }
  }

  // Kullanıcı girişi
  async login(loginDto: LoginDto): Promise<{
    user: User;
    accessToken: string;
  }> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('E-posta veya şifre hatalı');
    }

    // Son giriş tarihini güncelle
    await this.usersService.updateLastLogin((user as any)._id.toString());

    const accessToken = await this.generateAccessToken(user);

    // Şifreyi response'dan çıkar
    const { password, ...userWithoutPassword } = user.toObject();

    return {
      user: userWithoutPassword as User,
      accessToken,
    };
  }

  // OAuth giriş/kayıt
  async oauthLogin(oauthData: {
    email: string;
    firstName: string;
    lastName: string;
    provider: 'google' | 'facebook';
    providerId: string;
  }): Promise<{
    user: User;
    accessToken: string;
  }> {
    const user = await this.usersService.findOrCreateOAuthUser(oauthData);
    
    // Son giriş tarihini güncelle
    await this.usersService.updateLastLogin((user as any)._id.toString());

    const accessToken = await this.generateAccessToken(user);

    return {
      user,
      accessToken,
    };
  }

  // Kullanıcı doğrulama (e-posta + şifre)
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      return null;
    }

    // OAuth kullanıcıları şifre ile giriş yapamaz
    if (!user.password) {
      throw new UnauthorizedException('Bu hesap OAuth ile oluşturulmuş. Lütfen OAuth ile giriş yapın.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  // JWT token oluşturma
  private async generateAccessToken(user: any): Promise<string> {
    const payload = {
      email: user.email,
      sub: user._id.toString(),
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    return this.jwtService.sign(payload);
  }

  // Token doğrulama
  async validateToken(token: string): Promise<any> {
    try {
      const decoded = this.jwtService.verify(token);
      const user = await this.usersService.findById(decoded.sub);
      
      if (!user) {
        throw new UnauthorizedException('Geçersiz token');
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Geçersiz veya süresi dolmuş token');
    }
  }

  // Refresh token (gelecek için)
  async refreshToken(userId: string): Promise<string> {
    const user = await this.usersService.findById(userId);
    
    if (!user) {
      throw new UnauthorizedException('Kullanıcı bulunamadı');
    }

    return this.generateAccessToken(user);
  }

  // Şifre sıfırlama token'ı oluşturma (gelecek için)
  async generatePasswordResetToken(email: string): Promise<string> {
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      throw new Error('Kullanıcı bulunamadı');
    }

    // Reset token için kısa süreli JWT
    const payload = {
      email: user.email,
      sub: user._id.toString(),
      type: 'password-reset',
    };

    return this.jwtService.sign(payload, { expiresIn: '1h' });
  }

  // Şifre sıfırlama
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const decoded = this.jwtService.verify(token);
      
      if (decoded.type !== 'password-reset') {
        throw new Error('Geçersiz token türü');
      }

      const user = await this.usersService.findById(decoded.sub);
      
      if (!user) {
        throw new Error('Kullanıcı bulunamadı');
      }

      // Yeni şifreyi hashle ve güncelle
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await this.usersService.update((user as any)._id.toString(), { 
        password: hashedPassword 
      } as any);

    } catch (error) {
      throw new UnauthorizedException('Geçersiz veya süresi dolmuş reset token');
    }
  }
}
