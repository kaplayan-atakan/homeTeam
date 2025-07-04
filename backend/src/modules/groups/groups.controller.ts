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
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto, UpdateGroupDto, JoinGroupDto, AddMemberDto, RemoveMemberDto } from './dto/group.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.schema';
import { MemberRole } from './group.schema';

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createGroup(@Body() createGroupDto: CreateGroupDto, @Request() req) {
    try {
      const group = await this.groupsService.create(createGroupDto, req.user.userId);
      return {
        success: true,
        message: 'Grup başarıyla oluşturuldu',
        data: group,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Grup oluşturulurken hata oluştu',
        error: error.message,
      };
    }
  }

  @Get()
  async getUserGroups(@Request() req, @Query('page') page = 1, @Query('limit') limit = 10) {
    try {
      const groups = await this.groupsService.getUserGroups(req.user.userId);
      return {
        success: true,
        message: 'Gruplar başarıyla listelendi',
        data: groups,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Gruplar listelenirken hata oluştu',
        error: error.message,
      };
    }
  }

  @Get(':id')
  async getGroupById(@Param('id') id: string, @Request() req) {
    try {
      const group = await this.groupsService.findById(id);
      return {
        success: true,
        message: 'Grup bilgileri başarıyla getirildi',
        data: group,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Grup bilgileri getirilirken hata oluştu',
        error: error.message,
      };
    }
  }

  @Patch(':id')
  async updateGroup(
    @Param('id') id: string,
    @Body() updateGroupDto: UpdateGroupDto,
    @Request() req,
  ) {
    try {
      const group = await this.groupsService.update(id, updateGroupDto, req.user.userId);
      return {
        success: true,
        message: 'Grup başarıyla güncellendi',
        data: group,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Grup güncellenirken hata oluştu',
        error: error.message,
      };
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteGroup(@Param('id') id: string, @Request() req) {
    try {
      await this.groupsService.archiveGroup(id, { reason: 'Kullanıcı tarafından silindi' }, req.user.userId);
      return {
        success: true,
        message: 'Grup başarıyla silindi',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Grup silinirken hata oluştu',
        error: error.message,
      };
    }
  }

  @Post(':id/join')
  @HttpCode(HttpStatus.OK)
  async joinGroup(
    @Param('id') id: string,
    @Body() joinGroupDto: JoinGroupDto,
    @Request() req,
  ) {
    try {
      const result = await this.groupsService.joinGroup(joinGroupDto, req.user.userId);
      return {
        success: true,
        message: 'Gruba başarıyla katıldınız',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Gruba katılırken hata oluştu',
        error: error.message,
      };
    }
  }

  @Post(':id/leave')
  @HttpCode(HttpStatus.OK)
  async leaveGroup(@Param('id') id: string, @Request() req) {
    try {
      await this.groupsService.leaveGroup(id, {}, req.user.userId);
      return {
        success: true,
        message: 'Gruptan başarıyla ayrıldınız',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Gruptan ayrılırken hata oluştu',
        error: error.message,
      };
    }
  }

  @Post(':id/members')
  @HttpCode(HttpStatus.OK)
  async addMember(
    @Param('id') id: string,
    @Body() addMemberDto: AddMemberDto,
    @Request() req,
  ) {
    try {
      // Önce kullanıcıyı e-posta ile bul, sonra gruba ekle
      const result = await this.groupsService.inviteMember(id, { 
        email: addMemberDto.userId, // Bu durumda email bekleniyor
        role: addMemberDto.role 
      }, req.user.userId);
      return {
        success: true,
        message: 'Üye başarıyla eklendi',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Üye eklenirken hata oluştu',
        error: error.message,
      };
    }
  }

  @Delete(':id/members/:memberId')
  @HttpCode(HttpStatus.OK)
  async removeMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Request() req,
  ) {
    try {
      await this.groupsService.removeMember(id, { userId: memberId }, req.user.userId);
      return {
        success: true,
        message: 'Üye başarıyla çıkarıldı',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Üye çıkarılırken hata oluştu',
        error: error.message,
      };
    }
  }

  @Patch(':id/members/:memberId/role')
  @HttpCode(HttpStatus.OK)
  async updateMemberRole(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Body('role') role: MemberRole,
    @Request() req,
  ) {
    try {
      const result = await this.groupsService.updateMemberRole(id, { userId: memberId, role }, req.user.userId);
      return {
        success: true,
        message: 'Üye rolü başarıyla güncellendi',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Üye rolü güncellenirken hata oluştu',
        error: error.message,
      };
    }
  }

  @Get(':id/stats')
  async getGroupStats(@Param('id') id: string, @Request() req) {
    try {
      const stats = await this.groupsService.getGroupStats(id);
      return {
        success: true,
        message: 'Grup istatistikleri başarıyla getirildi',
        data: stats,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Grup istatistikleri getirilirken hata oluştu',
        error: error.message,
      };
    }
  }
}
