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
import { TasksService } from './tasks.service';
import { TaskStatus } from './task.schema';
import {
  CreateTaskDto,
  UpdateTaskDto,
  AssignTaskDto,
  AddCommentDto,
  TaskFilterDto,
  CompleteTaskDto,
  BulkUpdateTasksDto,
  TaskStatsDto,
  CreateSubtaskDto,
  TaskTemplateDto,
} from './dto/task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.schema';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTask(@Body() createTaskDto: CreateTaskDto, @Request() req) {
    try {
      const task = await this.tasksService.create(createTaskDto, req.user.userId);
      return {
        success: true,
        message: 'Görev başarıyla oluşturuldu',
        data: task,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Görev oluşturulurken hata oluştu',
        error: error.message,
      };
    }
  }

  @Get()
  async getTasks(@Query() filterDto: TaskFilterDto, @Request() req) {
    try {
      const result = await this.tasksService.findAll(filterDto, req.user.userId);
      return {
        success: true,
        message: 'Görevler başarıyla listelendi',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Görevler listelenirken hata oluştu',
        error: error.message,
      };
    }
  }

  @Get(':id')
  async getTaskById(@Param('id') id: string) {
    try {
      const task = await this.tasksService.findById(id);
      return {
        success: true,
        message: 'Görev bilgileri başarıyla getirildi',
        data: task,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Görev bilgileri getirilirken hata oluştu',
        error: error.message,
      };
    }
  }

  @Patch(':id')
  async updateTask(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req,
  ) {
    try {
      const task = await this.tasksService.update(id, updateTaskDto, req.user.userId);
      return {
        success: true,
        message: 'Görev başarıyla güncellendi',
        data: task,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Görev güncellenirken hata oluştu',
        error: error.message,
      };
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTask(@Param('id') id: string, @Request() req) {
    try {
      await this.tasksService.delete(id, req.user.userId);
      return {
        success: true,
        message: 'Görev başarıyla silindi',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Görev silinirken hata oluştu',
        error: error.message,
      };
    }
  }

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  async completeTask(
    @Param('id') id: string,
    @Body() completeDto: CompleteTaskDto,
    @Request() req,
  ) {
    try {
      const task = await this.tasksService.complete(id, completeDto, req.user.userId);
      return {
        success: true,
        message: 'Görev başarıyla tamamlandı',
        data: task,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Görev tamamlanırken hata oluştu',
        error: error.message,
      };
    }
  }

  @Post(':id/assign')
  @HttpCode(HttpStatus.OK)
  async assignTask(
    @Param('id') id: string,
    @Body() assignDto: AssignTaskDto,
    @Request() req,
  ) {
    try {
      const task = await this.tasksService.update(
        id,
        {
          assignedTo: assignDto.assignedTo,
        },
        req.user.userId,
      );
      return {
        success: true,
        message: 'Görev başarıyla atandı',
        data: task,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Görev atanırken hata oluştu',
        error: error.message,
      };
    }
  }

  @Post(':id/comments')
  @HttpCode(HttpStatus.CREATED)
  async addComment(
    @Param('id') id: string,
    @Body() commentDto: AddCommentDto,
    @Request() req,
  ) {
    try {
      const task = await this.tasksService.addComment(id, commentDto, req.user.userId);
      return {
        success: true,
        message: 'Yorum başarıyla eklendi',
        data: task,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Yorum eklenirken hata oluştu',
        error: error.message,
      };
    }
  }

  @Post('bulk-update')
  @HttpCode(HttpStatus.OK)
  async bulkUpdateTasks(@Body() bulkUpdateDto: BulkUpdateTasksDto, @Request() req) {
    try {
      await this.tasksService.bulkUpdate(bulkUpdateDto, req.user.userId);
      return {
        success: true,
        message: 'Görevler başarıyla güncellendi',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Görevler güncellenirken hata oluştu',
        error: error.message,
      };
    }
  }

  @Get('stats/overview')
  async getTaskStats(@Query() statsDto: TaskStatsDto, @Request() req) {
    try {
      const stats = await this.tasksService.getStats(statsDto, req.user.userId);
      return {
        success: true,
        message: 'Görev istatistikleri başarıyla getirildi',
        data: stats,
      };
    } catch (error) {
      return {
        success: false,
        message: 'İstatistikler getirilirken hata oluştu',
        error: error.message,
      };
    }
  }

  // Hızlı işlemler için endpoint'ler
  @Get('my/pending')
  async getMyPendingTasks(@Request() req) {
    try {
      const result = await this.tasksService.findAll(
        {
          assignedTo: req.user.userId,
          status: TaskStatus.PENDING,
          limit: 50,
        },
        req.user.userId,
      );
      return {
        success: true,
        message: 'Bekleyen görevleriniz listelendi',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Görevler getirilirken hata oluştu',
        error: error.message,
      };
    }
  }

  @Get('my/overdue')
  async getMyOverdueTasks(@Request() req) {
    try {
      const result = await this.tasksService.findAll(
        {
          assignedTo: req.user.userId,
          overdue: true,
          limit: 50,
        },
        req.user.userId,
      );
      return {
        success: true,
        message: 'Süresi geçen görevleriniz listelendi',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Görevler getirilirken hata oluştu',
        error: error.message,
      };
    }
  }

  @Get('my/completed-today')
  async getTodayCompletedTasks(@Request() req) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const result = await this.tasksService.findAll(
        {
          assignedTo: req.user.userId,
          status: TaskStatus.COMPLETED,
          // dueDateFrom: today,
          // dueDateTo: tomorrow,
          limit: 50,
        },
        req.user.userId,
      );
      return {
        success: true,
        message: 'Bugün tamamlanan görevleriniz listelendi',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Görevler getirilirken hata oluştu',
        error: error.message,
      };
    }
  }

  @Get('group/:groupId')
  async getGroupTasks(@Param('groupId') groupId: string, @Query() filterDto: TaskFilterDto, @Request() req) {
    try {
      const result = await this.tasksService.findAll(
        {
          ...filterDto,
          groupId: groupId,
        },
        req.user.userId,
      );
      return {
        success: true,
        message: 'Grup görevleri başarıyla listelendi',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Grup görevleri getirilirken hata oluştu',
        error: error.message,
      };
    }
  }

  @Post('quick/simple')
  @HttpCode(HttpStatus.CREATED)
  async createSimpleTask(
    @Body() data: { title: string; description?: string; groupId?: string },
    @Request() req,
  ) {
    try {
      const task = await this.tasksService.create(
        {
          title: data.title,
          description: data.description,
          groupId: data.groupId || req.user.defaultGroupId, // Varsayılan grup
          assignedTo: req.user.userId, // Kendisine atıyor
          slaMinutes: 24 * 60, // Varsayılan 24 saat
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 saat sonra
          priority: 'medium' as any,
        },
        req.user.userId,
      );
      return {
        success: true,
        message: 'Hızlı görev başarıyla oluşturuldu',
        data: task,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Görev oluşturulurken hata oluştu',
        error: error.message,
      };
    }
  }

  @Patch(':id/quick-complete')
  @HttpCode(HttpStatus.OK)
  async quickCompleteTask(@Param('id') id: string, @Request() req) {
    try {
      const task = await this.tasksService.complete(id, {}, req.user.userId);
      return {
        success: true,
        message: 'Görev hızlıca tamamlandı',
        data: task,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Görev tamamlanırken hata oluştu',
        error: error.message,
      };
    }
  }
}
