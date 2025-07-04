import { 
  Controller, 
  Post, 
  Body, 
  HttpCode, 
  HttpStatus,
  UseGuards,
  Request,
  Get 
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

// SOLID: Single Responsibility Principle - Kimlik doğrulama HTTP istekleri
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Kullanıcı kaydı
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    try {
      const result = await this.authService.register(registerDto);
      
      return {
        success: true,
        message: 'Hesap başarıyla oluşturuldu',
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Kullanıcı girişi
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    try {
      const result = await this.authService.login(loginDto);
      
      return {
        success: true,
        message: 'Giriş başarılı',
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Profil bilgisi (token ile)
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    return {
      success: true,
      data: req.user,
    };
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
      return {
        success: false,
        message: error.message,
      };
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
      return {
        success: false,
        message: 'E-posta gönderimi başarısız',
      };
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
      return {
        success: false,
        message: error.message,
      };
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
}
