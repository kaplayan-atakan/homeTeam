import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/user.schema';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import * as bcrypt from 'bcryptjs';

// SOLID: Single Responsibility Principle - Kimlik doğrulama işlemleri
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  // Kullanıcı kaydı
  async register(registerDto: RegisterDto): Promise<{
    success: boolean;
    message: string;
    data: {
      user: any;
      accessToken: string;
      refreshToken: string;
    };
  }> {
    const { email, password, firstName, lastName } = registerDto;

    // ✅ Email validation
    if (!this.isValidEmail(email)) {
      throw new BadRequestException('Geçersiz email formatı');
    }

    // ✅ Password validation
    if (!this.isValidPassword(password)) {
      throw new BadRequestException(
        'Şifre en az 8 karakter olmalı ve büyük harf, küçük harf, rakam ve özel karakter içermelidir'
      );
    }

    // ✅ Existing user check
    try {
      const existingUser = await this.userModel.findOne({ 
        email: email.toLowerCase() 
      });
      
      if (existingUser) {
        throw new ConflictException('Bu email adresi zaten kullanımda');
      }
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Kullanıcı kontrolü sırasında hata oluştu');
    }

    // ✅ Password hashing
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    try {
      // ✅ User creation
      const user = new this.userModel({
        firstName: this.sanitizeInput(firstName),
        lastName: this.sanitizeInput(lastName),
        email: email.toLowerCase(),
        password: hashedPassword,
      });

      const savedUser = await user.save();

      // ✅ Token generation
      const tokens = await this.generateTokens(savedUser._id.toString());
      
      // ✅ Refresh token'ı database'e kaydet
      await this.userModel.findByIdAndUpdate(savedUser._id, {
        refreshToken: tokens.refreshToken,
        lastLoginAt: new Date()
      });

      // ✅ Return user without password
      const userResponse = savedUser.toObject();
      delete userResponse.password;
      delete userResponse.refreshToken;

      return {
        success: true,
        message: 'Kullanıcı başarıyla oluşturuldu',
        data: {
          user: userResponse,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken
        }
      };
    } catch (error) {
      // ✅ MongoDB duplicate key error handling
      if (error.code === 11000) {
        throw new ConflictException('Bu email adresi zaten kullanımda');
      }
      throw new BadRequestException('Kullanıcı oluşturulurken hata oluştu');
    }
  }

  // Kullanıcı girişi
  async login(loginDto: LoginDto): Promise<{
    success: boolean;
    message: string;
    data: {
      user: any;
      accessToken: string;
      refreshToken: string;
    };
  }> {
    const { email, password } = loginDto;

    // ✅ Input validation
    if (!email || !password) {
      throw new BadRequestException('Email ve şifre gereklidir');
    }

    if (!this.isValidEmail(email)) {
      throw new BadRequestException('Geçersiz email formatı');
    }

    try {
      // ✅ User existence check with password field
      const user = await this.userModel
        .findOne({ email: email.toLowerCase() })
        .select('+password')
        .exec();

      if (!user) {
        throw new UnauthorizedException('Geçersiz email veya şifre');
      }

      // ✅ Active user check
      if (user.status !== 'active') {
        throw new UnauthorizedException('Hesabınız askıya alınmış');
      }

      // ✅ Password verification
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Geçersiz email veya şifre');
      }

      // ✅ Token generation
      const tokens = await this.generateTokens(user._id.toString());
      
      // ✅ Update last login and refresh token
      await this.userModel.findByIdAndUpdate(user._id, {
        refreshToken: tokens.refreshToken,
        lastLoginAt: new Date()
      });

      // ✅ Return user without sensitive data
      const userResponse = user.toObject();
      delete userResponse.password;
      delete userResponse.refreshToken;

      return {
        success: true,
        message: 'Giriş başarılı',
        data: {
          user: userResponse,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken
        }
      };
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Giriş işlemi sırasında hata oluştu');
    }
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

  // ✅ Get Profile Method
  async getProfile(userId: string) {
    try {
      const user = await this.userModel
        .findById(userId)
        .select('-password -refreshToken')
        .exec();

      if (!user) {
        throw new UnauthorizedException('Kullanıcı bulunamadı');
      }

      if (user.status !== 'active') {
        throw new UnauthorizedException('Hesabınız askıya alınmış');
      }

      return {
        success: true,
        message: 'Profil bilgileri alındı',
        data: {
          user: user.toObject()
        }
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Profil bilgileri alınırken hata oluştu');
    }
  }

  // Refresh token (gelecek için)
  async refreshToken(userId: string): Promise<string> {
    const user = await this.userModel.findById(userId);
    
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
      await this.userModel.findByIdAndUpdate(decoded.sub, { 
        password: hashedPassword 
      });

    } catch (error) {
      throw new UnauthorizedException('Geçersiz veya süresi dolmuş reset token');
    }
  }

  // ✅ Token generation with refresh token
  private async generateTokens(userId: string) {
    // Kullanıcı bilgilerini al
    const user = await this.usersService.findById(userId);
    
    const payload = { 
      sub: userId,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    };
    
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '15m'
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        expiresIn: '7d'
      })
    ]);

    return { accessToken, refreshToken };
  }

  // ✅ Email validation helper
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  // ✅ Password validation helper
  private isValidPassword(password: string): boolean {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password) && password.length <= 128;
  }

  // ✅ Input sanitization helper
  private sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>?/gm, '')
      .substring(0, 100);
  }
}
