import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type GroupDocument = Group & Document;

export enum GroupType {
  FAMILY = 'family',        // Aile
  ROOMMATES = 'roommates',  // Ev arkadaşları
  TEAM = 'team',           // İş ekibi
  FRIENDS = 'friends',     // Arkadaş grubu
  OTHER = 'other',         // Diğer
}

export enum GroupStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

export enum MemberRole {
  OWNER = 'owner',         // Grup sahibi
  ADMIN = 'admin',         // Grup yöneticisi
  MODERATOR = 'moderator', // Moderatör
  MEMBER = 'member',       // Üye
}

export interface GroupMember {
  userId: Types.ObjectId;
  role: MemberRole;
  joinedAt: Date;
  invitedBy?: Types.ObjectId;
  permissions: {
    canCreateTasks: boolean;
    canAssignTasks: boolean;
    canDeleteTasks: boolean;
    canInviteMembers: boolean;
    canRemoveMembers: boolean;
    canManageGroup: boolean;
  };
}

@Schema({ timestamps: true })
export class Group {
  @Prop({ required: true, trim: true, minlength: 3, maxlength: 50 })
  name: string;

  @Prop({ trim: true, maxlength: 200 })
  description?: string;

  @Prop({ 
    type: String, 
    enum: GroupType, 
    default: GroupType.FAMILY 
  })
  type: GroupType;

  @Prop({ 
    type: String, 
    enum: GroupStatus, 
    default: GroupStatus.ACTIVE 
  })
  status: GroupStatus;

  // Grup sahibi
  @Prop({ 
    type: Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  })
  owner: Types.ObjectId;

  // Grup üyeleri ve rolleri
  @Prop({ 
    type: [{
      userId: { type: Types.ObjectId, ref: 'User', required: true },
      role: { type: String, enum: MemberRole, default: MemberRole.MEMBER },
      joinedAt: { type: Date, default: Date.now },
      invitedBy: { type: Types.ObjectId, ref: 'User' },
      permissions: {
        canCreateTasks: { type: Boolean, default: true },
        canAssignTasks: { type: Boolean, default: false },
        canDeleteTasks: { type: Boolean, default: false },
        canInviteMembers: { type: Boolean, default: false },
        canRemoveMembers: { type: Boolean, default: false },
        canManageGroup: { type: Boolean, default: false },
      }
    }],
    default: []
  })
  members: GroupMember[];

  // Grup ayarları
  @Prop({ 
    type: Object,
    default: {
      isPublic: false,           // Herkese açık mı?
      requireApproval: true,     // Katılım onay gerektiriyor mu?
      allowSelfJoin: false,      // Kendiliğinden katılım
      maxMembers: 20,            // Maksimum üye sayısı
      defaultTaskSLA: 24,        // Varsayılan görev SLA (saat)
      enableNotifications: true, // Grup bildirimleri
      enableMusicIntegration: true, // Müzik entegrasyonu
    }
  })
  settings: {
    isPublic: boolean;
    requireApproval: boolean;
    allowSelfJoin: boolean;
    maxMembers: number;
    defaultTaskSLA: number;
    enableNotifications: boolean;
    enableMusicIntegration: boolean;
  };

  // Grup avatarı/resmi
  @Prop({ default: null })
  avatar?: string;

  // Grup renk teması
  @Prop({ default: '#6200EE' })
  colorTheme: string;

  // Grup istatistikleri
  @Prop({ 
    type: Object,
    default: {
      totalTasks: 0,
      completedTasks: 0,
      overdueTasks: 0,
      totalPoints: 0,
      averageCompletionTime: 0, // Ortalama tamamlanma süresi (saat)
    }
  })
  stats: {
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    totalPoints: number;
    averageCompletionTime: number;
  };

  // Bekleyen davetler
  @Prop({ 
    type: [{
      email: String,
      invitedBy: { type: Types.ObjectId, ref: 'User' },
      invitedAt: { type: Date, default: Date.now },
      token: String,
      expiresAt: Date,
    }],
    default: []
  })
  pendingInvites: Array<{
    email: string;
    invitedBy: Types.ObjectId;
    invitedAt: Date;
    token: string;
    expiresAt: Date;
  }>;

  // Plan bilgileri (premium özellikler için)
  @Prop({ 
    type: Object,
    default: {
      plan: 'free',              // 'free' | 'premium' | 'family'
      maxTasks: 50,             // Plan başına maksimum görev
      maxMembers: 5,            // Plan başına maksimum üye
      features: {
        advancedReports: false,
        customNotifications: false,
        musicIntegration: false,
        fileAttachments: false,
        apiAccess: false,
      }
    }
  })
  subscription: {
    plan: string;
    maxTasks: number;
    maxMembers: number;
    features: {
      advancedReports: boolean;
      customNotifications: boolean;
      musicIntegration: boolean;
      fileAttachments: boolean;
      apiAccess: boolean;
    };
  };

  // Grup aktivite log'u (son 100 aktivite)
  @Prop({ 
    type: [{
      action: String,           // 'member_joined', 'task_created', 'task_completed', etc.
      userId: { type: Types.ObjectId, ref: 'User' },
      targetId: Types.ObjectId, // Task ID, User ID, etc.
      details: Object,          // Ek detaylar
      timestamp: { type: Date, default: Date.now }
    }],
    default: []
  })
  activityLog: Array<{
    action: string;
    userId: Types.ObjectId;
    targetId?: Types.ObjectId;
    details?: any;
    timestamp: Date;
  }>;

  // Arşiv bilgileri
  @Prop({ default: null })
  archivedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  archivedBy?: Types.ObjectId;

  @Prop()
  archiveReason?: string;

  // Oluşturulma ve güncellenme tarihleri
  createdAt?: Date;
  updatedAt?: Date;
}

export const GroupSchema = SchemaFactory.createForClass(Group);

// Index'ler - performans ve sorgu optimizasyonu
GroupSchema.index({ owner: 1 });
GroupSchema.index({ 'members.userId': 1 });
GroupSchema.index({ status: 1 });
GroupSchema.index({ type: 1 });
GroupSchema.index({ createdAt: 1 });
GroupSchema.index({ name: 'text', description: 'text' }); // Metin arama için

// Virtual fields
GroupSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

GroupSchema.virtual('activeTaskCount').get(function() {
  return this.stats.totalTasks - this.stats.completedTasks;
});

// Methods
GroupSchema.methods.isMember = function(userId: string): boolean {
  return this.members.some(member => 
    member.userId.toString() === userId.toString()
  );
};

GroupSchema.methods.getMemberRole = function(userId: string): MemberRole | null {
  const member = this.members.find(member => 
    member.userId.toString() === userId.toString()
  );
  return member ? member.role : null;
};

GroupSchema.methods.canUserPerformAction = function(
  userId: string, 
  action: keyof GroupMember['permissions']
): boolean {
  const member = this.members.find(member => 
    member.userId.toString() === userId.toString()
  );
  
  if (!member) return false;
  
  // Owner ve Admin her şeyi yapabilir
  if (member.role === MemberRole.OWNER || member.role === MemberRole.ADMIN) {
    return true;
  }
  
  return member.permissions[action];
};
