import { 
  Injectable, 
  NotFoundException, 
  ConflictException, 
  BadRequestException,
  ForbiddenException 
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { 
  Group, 
  GroupDocument, 
  GroupType, 
  GroupStatus, 
  MemberRole,
  GroupMember 
} from './group.schema';
import {
  CreateGroupDto,
  UpdateGroupDto,
  InviteMemberDto,
  InviteMultipleMembersDto,
  UpdateMemberRoleDto,
  UpdateMemberPermissionsDto,
  RemoveMemberDto,
  JoinGroupDto,
  LeaveGroupDto,
  GroupFilterDto,
  ArchiveGroupDto,
  TransferOwnershipDto,
  GroupActivityFilterDto
} from './dto/group.dto';
import { UsersService } from '../users/users.service';

// SOLID: Single Responsibility Principle - Grup işlemleri için tek sorumluluk
@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
    private usersService: UsersService,
  ) {}

  // Yeni grup oluşturma
  async create(createGroupDto: CreateGroupDto, ownerId: string): Promise<Group> {
    try {
      // Kullanıcının mevcut grup sayısını kontrol et
      const userGroupCount = await this.getUserGroupCount(ownerId);
      const maxGroups = 10; // Varsayılan limit, plan bazlı olacak
      
      if (userGroupCount >= maxGroups) {
        throw new BadRequestException(`En fazla ${maxGroups} grup oluşturabilirsiniz`);
      }

      // Grup adı benzersizlik kontrolü (opsiyonel)
      const existingGroup = await this.groupModel.findOne({
        name: createGroupDto.name,
        owner: ownerId,
        status: { $ne: GroupStatus.ARCHIVED }
      });

      if (existingGroup) {
        throw new ConflictException('Bu isimde bir grubunuz zaten var');
      }

      // Owner'ı ilk üye olarak ekle
      const ownerMember: GroupMember = {
        userId: new Types.ObjectId(ownerId),
        role: MemberRole.OWNER,
        joinedAt: new Date(),
        permissions: {
          canCreateTasks: true,
          canAssignTasks: true,
          canDeleteTasks: true,
          canInviteMembers: true,
          canRemoveMembers: true,
          canManageGroup: true,
        }
      };

      const group = new this.groupModel({
        ...createGroupDto,
        owner: ownerId,
        members: [ownerMember],
        activityLog: [{
          action: 'group_created',
          userId: new Types.ObjectId(ownerId),
          details: { groupName: createGroupDto.name },
          timestamp: new Date()
        }]
      });

      const savedGroup = await group.save();
      
      // Kullanıcının groups listesine ekle
      await this.usersService.addToGroup(ownerId, savedGroup._id.toString());

      return await this.findById(savedGroup._id.toString());
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Grup oluşturulamadı');
    }
  }

  // Tüm grupları listeleme (filtreleme ile)
  async findAll(filterDto: GroupFilterDto, userId?: string): Promise<{
    groups: Group[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      type,
      search,
      isOwner,
      isPublic,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = filterDto;

    const query: any = {
      status: GroupStatus.ACTIVE
    };

    // Tip filtresi
    if (type) {
      query.type = type;
    }

    // Arama filtresi
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Sadece sahip olduğum gruplar
    if (isOwner && userId) {
      query.owner = userId;
    }

    // Sadece herkese açık gruplar
    if (isPublic !== undefined) {
      query['settings.isPublic'] = isPublic;
    }

    // Eğer userId verilmişse, kullanıcının üyesi olduğu grupları getir
    if (userId && !isOwner) {
      query['members.userId'] = userId;
    }

    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [groups, total] = await Promise.all([
      this.groupModel
        .find(query)
        .populate('owner', 'firstName lastName email profileImage')
        .populate('members.userId', 'firstName lastName email profileImage')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.groupModel.countDocuments(query)
    ]);

    return {
      groups,
      total,
      page,
      limit
    };
  }

  // ID ile grup bulma
  async findById(id: string): Promise<GroupDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Geçersiz grup ID');
    }

    const group = await this.groupModel
      .findById(id)
      .populate('owner', 'firstName lastName email profileImage')
      .populate('members.userId', 'firstName lastName email profileImage')
      .populate('members.invitedBy', 'firstName lastName')
      .exec();

    if (!group || group.status === GroupStatus.ARCHIVED) {
      throw new NotFoundException('Grup bulunamadı');
    }

    return group;
  }

  // Grup güncelleme
  async update(
    id: string, 
    updateGroupDto: UpdateGroupDto, 
    userId: string
  ): Promise<Group> {
    const group = await this.findById(id);
    
    // Yetki kontrolü
    if (!group.canUserPerformAction(userId, 'canManageGroup')) {
      throw new ForbiddenException('Bu işlem için yetkiniz yok');
    }

    const updatedGroup = await this.groupModel
      .findByIdAndUpdate(
        id,
        { 
          ...updateGroupDto,
          updatedAt: new Date(),
          $push: {
            activityLog: {
              action: 'group_updated',
              userId: new Types.ObjectId(userId),
              details: updateGroupDto,
              timestamp: new Date()
            }
          }
        },
        { new: true, runValidators: true }
      )
      .populate('owner', 'firstName lastName email profileImage')
      .populate('members.userId', 'firstName lastName email profileImage')
      .exec();

    if (!updatedGroup) {
      throw new NotFoundException('Grup bulunamadı');
    }

    return updatedGroup;
  }

  // Üye davet etme
  async inviteMember(
    groupId: string,
    inviteDto: InviteMemberDto,
    inviterId: string
  ): Promise<{ success: boolean; message: string }> {
    const group = await this.findById(groupId);

    // Yetki kontrolü
    if (!group.canUserPerformAction(inviterId, 'canInviteMembers')) {
      throw new ForbiddenException('Üye davet etme yetkiniz yok');
    }

    // Maksimum üye sayısı kontrolü
    if (group.members.length >= group.settings.maxMembers) {
      throw new BadRequestException(`Maksimum ${group.settings.maxMembers} üye limiti aşıldı`);
    }

    // Kullanıcı zaten üye mi?
    const existingUser = await this.usersService.findByEmail(inviteDto.email);
    if (existingUser && group.isMember(existingUser.id)) {
      throw new ConflictException('Bu kullanıcı zaten grup üyesi');
    }

    // Bekleyen davet var mı?
    const existingInvite = group.pendingInvites.find(
      invite => invite.email === inviteDto.email
    );
    if (existingInvite) {
      throw new ConflictException('Bu e-posta adresine zaten davet gönderilmiş');
    }

    // Davet token'ı oluştur
    const inviteToken = this.generateInviteToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 gün geçerli

    // Daveti kaydet
    await this.groupModel.findByIdAndUpdate(groupId, {
      $push: {
        pendingInvites: {
          email: inviteDto.email,
          invitedBy: new Types.ObjectId(inviterId),
          invitedAt: new Date(),
          token: inviteToken,
          expiresAt
        },
        activityLog: {
          action: 'member_invited',
          userId: new Types.ObjectId(inviterId),
          details: { email: inviteDto.email, role: inviteDto.role },
          timestamp: new Date()
        }
      }
    });

    // TODO: E-posta gönderimi burada yapılacak
    // await this.emailService.sendGroupInvite(inviteDto.email, group, inviteToken);

    return {
      success: true,
      message: 'Davet başarıyla gönderildi'
    };
  }

  // Gruba katılma (davet token ile)
  async joinGroup(
    joinDto: JoinGroupDto,
    userId: string
  ): Promise<{ success: boolean; message: string; group: Group }> {
    // Token ile daveti bul
    const group = await this.groupModel.findOne({
      'pendingInvites.token': joinDto.inviteToken,
      'pendingInvites.expiresAt': { $gt: new Date() }
    });

    if (!group) {
      throw new NotFoundException('Geçersiz veya süresi dolmuş davet kodu');
    }

    const invite = group.pendingInvites.find(
      inv => inv.token === joinDto.inviteToken
    );

    // Kullanıcı zaten üye mi?
    if (group.isMember(userId)) {
      throw new ConflictException('Zaten bu grubun üyesisiniz');
    }

    // Maksimum üye sayısı kontrolü
    if (group.members.length >= group.settings.maxMembers) {
      throw new BadRequestException(`Grup dolu (maksimum ${group.settings.maxMembers} üye)`);
    }

    // Yeni üye ekle
    const newMember: GroupMember = {
      userId: new Types.ObjectId(userId),
      role: MemberRole.MEMBER,
      joinedAt: new Date(),
      invitedBy: invite.invitedBy,
      permissions: {
        canCreateTasks: true,
        canAssignTasks: false,
        canDeleteTasks: false,
        canInviteMembers: false,
        canRemoveMembers: false,
        canManageGroup: false,
      }
    };

    // Grubu güncelle
    const updatedGroup = await this.groupModel.findByIdAndUpdate(
      group._id,
      {
        $push: {
          members: newMember,
          activityLog: {
            action: 'member_joined',
            userId: new Types.ObjectId(userId),
            details: { via: 'invite' },
            timestamp: new Date()
          }
        },
        $pull: {
          pendingInvites: { token: joinDto.inviteToken }
        }
      },
      { new: true }
    ).populate('owner', 'firstName lastName email profileImage')
     .populate('members.userId', 'firstName lastName email profileImage');

    // Kullanıcının groups listesine ekle
    await this.usersService.addToGroup(userId, group._id.toString());

    return {
      success: true,
      message: 'Gruba başarıyla katıldınız',
      group: updatedGroup
    };
  }

  // Üye rolü güncelleme
  async updateMemberRole(
    groupId: string,
    updateRoleDto: UpdateMemberRoleDto,
    requesterId: string
  ): Promise<Group> {
    const group = await this.findById(groupId);

    // Yetki kontrolü - sadece owner ve admin rol değiştirebilir
    const requesterRole = group.getMemberRole(requesterId);
    if (requesterRole !== MemberRole.OWNER && requesterRole !== MemberRole.ADMIN) {
      throw new ForbiddenException('Rol değiştirme yetkiniz yok');
    }

    // Owner başka birine owner yapamaz (transfer ownership kullanılmalı)
    if (updateRoleDto.role === MemberRole.OWNER) {
      throw new BadRequestException('Owner rolü transfer işlemi ile değiştirilebilir');
    }

    // Hedef üye kontrolü
    if (!group.isMember(updateRoleDto.userId)) {
      throw new NotFoundException('Kullanıcı bu grubun üyesi değil');
    }

    const updatedGroup = await this.groupModel.findOneAndUpdate(
      {
        _id: groupId,
        'members.userId': updateRoleDto.userId
      },
      {
        $set: {
          'members.$.role': updateRoleDto.role
        },
        $push: {
          activityLog: {
            action: 'member_role_updated',
            userId: new Types.ObjectId(requesterId),
            targetId: new Types.ObjectId(updateRoleDto.userId),
            details: { newRole: updateRoleDto.role },
            timestamp: new Date()
          }
        }
      },
      { new: true }
    ).populate('owner', 'firstName lastName email profileImage')
     .populate('members.userId', 'firstName lastName email profileImage');

    return updatedGroup;
  }

  // Üye çıkarma
  async removeMember(
    groupId: string,
    removeDto: RemoveMemberDto,
    requesterId: string
  ): Promise<{ success: boolean; message: string }> {
    const group = await this.findById(groupId);

    // Yetki kontrolü
    if (!group.canUserPerformAction(requesterId, 'canRemoveMembers')) {
      throw new ForbiddenException('Üye çıkarma yetkiniz yok');
    }

    // Owner'ı çıkaramaz
    if (removeDto.userId === group.owner.toString()) {
      throw new BadRequestException('Grup sahibi çıkarılamaz');
    }

    // Üye kontrolü
    if (!group.isMember(removeDto.userId)) {
      throw new NotFoundException('Kullanıcı bu grubun üyesi değil');
    }

    await this.groupModel.findByIdAndUpdate(groupId, {
      $pull: {
        members: { userId: new Types.ObjectId(removeDto.userId) }
      },
      $push: {
        activityLog: {
          action: 'member_removed',
          userId: new Types.ObjectId(requesterId),
          targetId: new Types.ObjectId(removeDto.userId),
          details: { reason: removeDto.reason },
          timestamp: new Date()
        }
      }
    });

    // Kullanıcının groups listesinden çıkar
    await this.usersService.removeFromGroup(removeDto.userId, groupId);

    return {
      success: true,
      message: 'Üye başarıyla çıkarıldı'
    };
  }

  // Gruptan ayrılma
  async leaveGroup(
    groupId: string,
    leaveDto: LeaveGroupDto,
    userId: string
  ): Promise<{ success: boolean; message: string }> {
    const group = await this.findById(groupId);

    // Owner ayrılamaz, ownership transfer etmeli
    if (group.owner.toString() === userId) {
      throw new BadRequestException('Grup sahibi ayrılamaz. Önce ownership transfer edin.');
    }

    // Üye kontrolü
    if (!group.isMember(userId)) {
      throw new NotFoundException('Bu grubun üyesi değilsiniz');
    }

    await this.groupModel.findByIdAndUpdate(groupId, {
      $pull: {
        members: { userId: new Types.ObjectId(userId) }
      },
      $push: {
        activityLog: {
          action: 'member_left',
          userId: new Types.ObjectId(userId),
          details: { reason: leaveDto.reason },
          timestamp: new Date()
        }
      }
    });

    // Kullanıcının groups listesinden çıkar
    await this.usersService.removeFromGroup(userId, groupId);

    return {
      success: true,
      message: 'Gruptan başarıyla ayrıldınız'
    };
  }

  // Grup arşivleme
  async archiveGroup(
    groupId: string,
    archiveDto: ArchiveGroupDto,
    userId: string
  ): Promise<{ success: boolean; message: string }> {
    const group = await this.findById(groupId);

    // Sadece owner arşivleyebilir
    if (group.owner.toString() !== userId) {
      throw new ForbiddenException('Sadece grup sahibi arşivleyebilir');
    }

    await this.groupModel.findByIdAndUpdate(groupId, {
      status: GroupStatus.ARCHIVED,
      archivedAt: new Date(),
      archivedBy: userId,
      archiveReason: archiveDto.reason,
      $push: {
        activityLog: {
          action: 'group_archived',
          userId: new Types.ObjectId(userId),
          details: { reason: archiveDto.reason },
          timestamp: new Date()
        }
      }
    });

    return {
      success: true,
      message: 'Grup başarıyla arşivlendi'
    };
  }

  // Yardımcı metodlar
  private async getUserGroupCount(userId: string): Promise<number> {
    return this.groupModel.countDocuments({
      owner: userId,
      status: { $ne: GroupStatus.ARCHIVED }
    });
  }

  private generateInviteToken(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  // Grup istatistikleri
  async getGroupStats(groupId: string): Promise<any> {
    const group = await this.findById(groupId);
    
    // TODO: Task modülü ile entegrasyon sonrası detaylı istatistikler
    return {
      memberCount: group.members.length,
      ...group.stats
    };
  }

  // Kullanıcının gruplarını getirme
  async getUserGroups(userId: string): Promise<GroupDocument[]> {
    return this.groupModel
      .find({
        'members.userId': userId,
        status: GroupStatus.ACTIVE
      })
      .populate('owner', 'firstName lastName email profileImage')
      .sort({ updatedAt: -1 })
      .exec();
  }

  // Alias for findUserGroups (used by WebSocket)
  async findUserGroups(userId: string): Promise<GroupDocument[]> {
    return this.getUserGroups(userId);
  }
}
