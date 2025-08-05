import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DeviceTokenDocument = DeviceToken & Document;

@Schema({ timestamps: true })
export class DeviceToken {
  @Prop({ required: true })
  token: string;

  @Prop({ 
    required: true, 
    enum: ['ios', 'android'],
    type: String 
  })
  platform: 'ios' | 'android';

  @Prop({ 
    type: Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  })
  userId: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: new Date() })
  lastUsed: Date;

  // Timestamps (createdAt, updatedAt) otomatik eklenir
  createdAt?: Date;
  updatedAt?: Date;
}

export const DeviceTokenSchema = SchemaFactory.createForClass(DeviceToken);

// Compound index - bir kullanıcının aynı token'ını birden fazla kez kaydetmeyi önler
DeviceTokenSchema.index({ userId: 1, token: 1 }, { unique: true });

// Token'a göre arama için index
DeviceTokenSchema.index({ token: 1 });

// Inactive token'ları temizlemek için index
DeviceTokenSchema.index({ isActive: 1, lastUsed: 1 });
