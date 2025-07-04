import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { 
  CreateUserDto, 
  UpdateUserDto, 
  UpdateUserRoleDto, 
  UpdateUserStatusDto,
  UpdateNotificationPreferencesDto 
} from './dto/user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './user.schema';

// SOLID: Single Responsibility Principle - Kullanıcı HTTP istekleri için tek sorumluluk
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Kullanıcı oluşturma (herkese açık - kayıt)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return {
      success: true,
      message: 'Kullanıcı başarıyla oluşturuldu',
      data: user,
    };
  }

  // Tüm kullanıcıları getirme (sadece admin)
  @Get()
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async findAll() {
    const users = await this.usersService.findAll();
    return {
      success: true,
      data: users,
    };
  }

  // Kendi profilini görüntüleme
  @Get('profile')
  async getProfile(@Request() req) {
    const user = await this.usersService.findById(req.user.id);
    return {
      success: true,
      data: user,
    };
  }

  // ID ile kullanıcı getirme
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    return {
      success: true,
      data: user,
    };
  }

  // Kendi profilini güncelleme
  @Patch('profile')
  async updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.usersService.update(req.user.id, updateUserDto);
    return {
      success: true,
      message: 'Profil başarıyla güncellendi',
      data: user,
    };
  }

  // Kullanıcı güncelleme (admin veya kendi profili)
  @Patch(':id')
  async update(
    @Param('id') id: string, 
    @Body() updateUserDto: UpdateUserDto,
    @Request() req
  ) {
    // Sadece admin veya kullanıcının kendisi güncelleyebilir
    if (req.user.role !== UserRole.ADMIN && req.user.id !== id) {
      throw new Error('Bu işlem için yetkiniz yok');
    }

    const user = await this.usersService.update(id, updateUserDto);
    return {
      success: true,
      message: 'Kullanıcı başarıyla güncellendi',
      data: user,
    };
  }

  // Kullanıcı rolü güncelleme (sadece admin)
  @Patch(':id/role')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async updateRole(
    @Param('id') id: string, 
    @Body() updateRoleDto: UpdateUserRoleDto
  ) {
    const user = await this.usersService.updateRole(id, updateRoleDto);
    return {
      success: true,
      message: 'Kullanıcı rolü başarıyla güncellendi',
      data: user,
    };
  }

  // Kullanıcı durumu güncelleme (sadece admin)
  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async updateStatus(
    @Param('id') id: string, 
    @Body() updateStatusDto: UpdateUserStatusDto
  ) {
    const user = await this.usersService.updateStatus(id, updateStatusDto);
    return {
      success: true,
      message: 'Kullanıcı durumu başarıyla güncellendi',
      data: user,
    };
  }

  // Bildirim tercihlerini güncelleme
  @Patch('profile/notifications')
  async updateNotificationPreferences(
    @Request() req, 
    @Body() preferences: UpdateNotificationPreferencesDto
  ) {
    const user = await this.usersService.updateNotificationPreferences(
      req.user.id, 
      preferences
    );
    return {
      success: true,
      message: 'Bildirim tercihleri güncellendi',
      data: user,
    };
  }

  // Şifre değiştirme
  @Patch('profile/change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Request() req,
    @Body() body: { oldPassword: string; newPassword: string }
  ) {
    await this.usersService.changePassword(
      req.user.id,
      body.oldPassword,
      body.newPassword
    );
    
    return {
      success: true,
      message: 'Şifre başarıyla değiştirildi',
    };
  }

  // Kullanıcı silme (soft delete - sadece admin)
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
    return {
      success: true,
      message: 'Kullanıcı başarıyla silindi',
    };
  }
}
