import { 
  Controller, 
  Post, 
  Body, 
  HttpCode, 
  HttpStatus,
  UseGuards,
  Request,
  Get,
  UsePipes,
  ValidationPipe,
  HttpException,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthService } from './services/google-auth.service';

// SOLID: Single Responsibility Principle - Kimlik doğrulama HTTP istekleri
@Controller('auth')
@UsePipes(new ValidationPipe({ 
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  transformOptions: {
    enableImplicitConversion: false
  }
}))
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleAuthService: GoogleAuthService,
  ) {}

  // Kullanıcı kaydı
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    try {
      return await this.authService.register(registerDto);
    } catch (error) {
      // NestJS HttpException'lar (BadRequestException, ConflictException vb.) doğrudan throw edilsin
      if (error instanceof HttpException) {
        throw error;
      }
      // Bilinmeyen hatalar için
      throw new InternalServerErrorException('Kayıt işlemi başarısız');
    }
  }

  // Kullanıcı girişi
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    try {
      return await this.authService.login(loginDto);
    } catch (error) {
      // NestJS HttpException'lar (UnauthorizedException, BadRequestException vb.) doğrudan throw edilsin
      if (error instanceof HttpException) {
        throw error;
      }
      // Bilinmeyen hatalar için
      throw new InternalServerErrorException('Giriş işlemi başarısız');
    }
  }

  // Profil bilgisi (token ile)
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getProfile(@Request() req) {
    try {
      return await this.authService.getProfile(req.user.id);
    } catch (error) {
      throw new InternalServerErrorException('Profil bilgisi alınamadı');
    }
  }

  // Token doğrulama
  @Post('verify-token')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async verifyToken(@Request() req) {
    return {
      success: true,
      message: 'Token geçerli',
      data: req.user,
    };
  }

  // Token yenileme
  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Request() req) {
    try {
      const newToken = await this.authService.refreshToken(req.user.id);
      
      return {
        success: true,
        message: 'Token yenilendi',
        data: {
          accessToken: newToken,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Token yenileme başarısız');
    }
  }

  // Şifre sıfırlama isteği
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    try {
      const resetToken = await this.authService.generatePasswordResetToken(
        forgotPasswordDto.email
      );
      
      // Gerçek uygulamada bu token e-posta ile gönderilir
      // Şu an sadece response'da döneceğiz (geliştirme amaçlı)
      
      return {
        success: true,
        message: 'Şifre sıfırlama e-postası gönderildi',
        data: {
          resetToken, // Geliştirme ortamı için
        },
      };
    } catch (error) {
      if (error.message.includes('Kullanıcı bulunamadı')) {
        throw new BadRequestException('E-posta adresi bulunamadı');
      }
      throw new InternalServerErrorException('E-posta gönderimi başarısız');
    }
  }

  // Şifre sıfırlama
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    try {
      await this.authService.resetPassword(
        resetPasswordDto.token,
        resetPasswordDto.newPassword
      );
      
      return {
        success: true,
        message: 'Şifre başarıyla sıfırlandı',
      };
    } catch (error) {
      if (error.message.includes('Token geçersiz') || 
          error.message.includes('Token süresi dolmuş')) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException('Şifre sıfırlama başarısız');
    }
  }

  // Çıkış (frontend'de token silme yeterli)
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout() {
    return {
      success: true,
      message: 'Çıkış başarılı',
    };
  }

  // Google OAuth giriş
  @Post('google')
  @HttpCode(HttpStatus.OK)
  async googleLogin(@Body() body: { token: string }) {
    try {
      // Google token'ı doğrula ve kullanıcı bilgilerini al
      const googleUserData = await this.googleAuthService.verifyGoogleToken(body.token);
      
      const oauthData = {
        email: googleUserData.email,
        firstName: googleUserData.firstName,
        lastName: googleUserData.lastName,
        provider: 'google' as 'google',
        providerId: googleUserData.providerId,
      };

      const result = await this.authService.oauthLogin(oauthData);

      return {
        success: true,
        message: 'Google ile giriş başarılı',
        data: result,
      };
    } catch (error) {
      console.error('Google login error:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Google token doğrulanamadı');
    }
  }

  // Facebook OAuth giriş
  @Post('facebook')
  @HttpCode(HttpStatus.OK)
  async facebookLogin(@Body() body: { token: string }) {
    try {
      // Facebook token'ı doğrula ve kullanıcı bilgilerini al
      // Bu örnekte frontend'den gelen user bilgilerini kullanacağız
      
      // Geçici olarak mock data kullanıyoruz
      const mockFacebookUserData = {
        email: 'user@facebook.com',
        firstName: 'Facebook',
        lastName: 'User',
        provider: 'facebook' as 'facebook',
        providerId: 'facebook_id_' + Date.now(),
      };

      const result = await this.authService.oauthLogin(mockFacebookUserData);

      return {
        success: true,
        message: 'Facebook ile giriş başarılı',
        data: result,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Facebook giriş işlemi başarısız');
    }
  }
}
