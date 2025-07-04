import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument, UserRole, UserStatus } from './user.schema';
import { 
  CreateUserDto, 
  UpdateUserDto, 
  UpdateUserRoleDto, 
  UpdateUserStatusDto,
  UpdateNotificationPreferencesDto 
} from './dto/user.dto';

// SOLID: Single Responsibility Principle - Kullanıcı işlemleri için tek sorumluluk
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  // Kullanıcı oluşturma
  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      // E-posta kontrolü
      const existingUser = await this.userModel.findOne({ 
        email: createUserDto.email.toLowerCase() 
      });
      
      if (existingUser) {
        throw new ConflictException('Bu e-posta adresi zaten kullanılıyor');
      }

      // Şifre hashleme
      const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

      const user = new this.userModel({
        ...createUserDto,
        email: createUserDto.email.toLowerCase(),
        password: hashedPassword,
      });

      return await user.save();
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Kullanıcı oluşturulamadı');
    }
  }

  // Tüm kullanıcıları getirme (admin)
  async findAll(): Promise<User[]> {
    return this.userModel
      .find()
      .select('-password') // Şifreleri döndürme
      .populate('groups', 'name description')
      .exec();
  }

  // ID ile kullanıcı bulma
  async findById(id: string): Promise<User> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Geçersiz kullanıcı ID');
    }

    const user = await this.userModel
      .findById(id)
      .select('-password')
      .populate('groups', 'name description')
      .exec();

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    return user;
  }

  // E-posta ile kullanıcı bulma (kimlik doğrulama için)
  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ 
      email: email.toLowerCase() 
    }).exec();
  }

  // OAuth ile kullanıcı bulma veya oluşturma
  async findOrCreateOAuthUser(oauthData: {
    email: string;
    firstName: string;
    lastName: string;
    provider: 'google' | 'facebook';
    providerId: string;
  }): Promise<User> {
    let user = await this.userModel.findOne({ 
      email: oauthData.email.toLowerCase() 
    });

    if (!user) {
      // Yeni OAuth kullanıcısı oluştur
      user = new this.userModel({
        email: oauthData.email.toLowerCase(),
        firstName: oauthData.firstName,
        lastName: oauthData.lastName,
        [`${oauthData.provider}Auth`]: {
          id: oauthData.providerId,
          email: oauthData.email,
        },
      });
    } else {
      // Mevcut kullanıcıya OAuth bilgisi ekle
      user[`${oauthData.provider}Auth`] = {
        id: oauthData.providerId,
        email: oauthData.email,
      };
    }

    return await user.save();
  }

  // Kullanıcı güncelleme
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Geçersiz kullanıcı ID');
    }

    const user = await this.userModel
      .findByIdAndUpdate(
        id,
        { 
          ...updateUserDto,
          updatedAt: new Date(),
        },
        { new: true, runValidators: true }
      )
      .select('-password')
      .exec();

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    return user;
  }

  // Kullanıcı rolü güncelleme (admin)
  async updateRole(id: string, updateRoleDto: UpdateUserRoleDto): Promise<User> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Geçersiz kullanıcı ID');
    }

    const user = await this.userModel
      .findByIdAndUpdate(
        id,
        { role: updateRoleDto.role },
        { new: true, runValidators: true }
      )
      .select('-password')
      .exec();

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    return user;
  }

  // Kullanıcı durumu güncelleme (admin)
  async updateStatus(id: string, updateStatusDto: UpdateUserStatusDto): Promise<User> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Geçersiz kullanıcı ID');
    }

    const user = await this.userModel
      .findByIdAndUpdate(
        id,
        { status: updateStatusDto.status },
        { new: true, runValidators: true }
      )
      .select('-password')
      .exec();

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    return user;
  }

  // Bildirim tercihlerini güncelleme
  async updateNotificationPreferences(
    id: string, 
    preferences: UpdateNotificationPreferencesDto
  ): Promise<User> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Geçersiz kullanıcı ID');
    }

    const user = await this.userModel
      .findByIdAndUpdate(
        id,
        { 
          $set: { 
            'notificationPreferences': {
              ...preferences
            }
          }
        },
        { new: true, runValidators: true }
      )
      .select('-password')
      .exec();

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    return user;
  }

  // Son giriş tarihini güncelleme
  async updateLastLogin(id: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(
        id,
        { lastLoginAt: new Date() }
      )
      .exec();
  }

  // Kullanıcı silme (soft delete - durum güncelleme)
  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Geçersiz kullanıcı ID');
    }

    const result = await this.userModel
      .findByIdAndUpdate(
        id,
        { status: UserStatus.INACTIVE },
        { new: true }
      )
      .exec();

    if (!result) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }
  }

  // Şifre değiştirme
  async changePassword(id: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await this.userModel.findById(id).exec();
    
    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    if (!user.password) {
      throw new BadRequestException('OAuth kullanıcıları şifre değiştiremez');
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    
    if (!isOldPasswordValid) {
      throw new BadRequestException('Mevcut şifre yanlış');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    
    await this.userModel
      .findByIdAndUpdate(id, { password: hashedNewPassword })
      .exec();
  }

  // Grup ekleme/çıkarma
  async addToGroup(userId: string, groupId: string): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $addToSet: { groups: groupId } },
        { new: true }
      )
      .select('-password')
      .exec();

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    return user;
  }

  async removeFromGroup(userId: string, groupId: string): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $pull: { groups: groupId } },
        { new: true }
      )
      .select('-password')
      .exec();

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    return user;
  }
}
