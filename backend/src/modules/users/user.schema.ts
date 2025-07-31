import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  ADMIN = 'admin',
  MEMBER = 'member',
  GUEST = 'guest',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ 
    required: true, 
    unique: true, 
    lowercase: true,
    trim: true,
    index: true  // ✅ Index eklendi
  })
  email: string;

  @Prop({ required: false, select: false }) // ✅ Password'u default response'dan çıkar
  password?: string;

  @Prop({ 
    type: String, 
    enum: UserRole, 
    default: UserRole.MEMBER 
  })
  role: UserRole;

  @Prop({ 
    type: String, 
    enum: UserStatus, 
    default: UserStatus.ACTIVE 
  })
  status: UserStatus;

  @Prop({ default: null })
  profileImage?: string;

  @Prop({ default: null })
  phoneNumber?: string;

  // OAuth bilgileri
  @Prop({ type: Object, default: null })
  googleAuth?: {
    id: string;
    email: string;
  };

  @Prop({ type: Object, default: null })
  facebookAuth?: {
    id: string;
    email: string;
  };

  // Müzik servisleri entegrasyonu
  @Prop({ type: Object, default: null })
  spotifyAuth?: {
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
  };

  @Prop({ type: Object, default: null })
  youtubeAuth?: {
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
  };

  // Grup üyelikleri
  @Prop({ 
    type: [{ type: Types.ObjectId, ref: 'Group' }],
    default: [] 
  })
  groups: Types.ObjectId[];

  // Bildirim tercihleri
  @Prop({ 
    type: Object, 
    default: {
      email: true,
      push: true,
      sms: false,
      taskReminders: true,
      groupMessages: true,
    }
  })
  notificationPreferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
    taskReminders: boolean;
    groupMessages: boolean;
  };

  // Refresh token field'ı eklendi
  @Prop({ select: false })
  refreshToken?: string;

  // Son giriş tarihi
  @Prop({ default: new Date() })
  lastLoginAt: Date;

  // Hesap oluşturma tarihi (timestamps: true ile otomatik)
  createdAt?: Date;
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// ✅ MongoDB unique index oluştur
UserSchema.index({ email: 1 }, { unique: true });
