import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Task,
  TaskDocument,
  TaskStatus,
  TaskPriority,
  RecurrenceType,
} from './task.schema';
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
import { GroupsService } from '../groups/groups.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MusicService } from '../music/music.service';
import { WebsocketGateway } from '../../websocket/websocket.gateway';

// SOLID: Single Responsibility Principle - Görev işlemleri için tek sorumluluk
@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    private groupsService: GroupsService,
    private notificationsService: NotificationsService,
    private musicService: MusicService,
    private websocketGateway: WebsocketGateway,
  ) {}

  // Görev oluşturma
  async create(createTaskDto: CreateTaskDto, createdBy: string): Promise<Task> {
    try {
      // Grup erişim kontrolü
      if (createTaskDto.groupId) {
        const group = await this.groupsService.findById(createTaskDto.groupId);
        if (!group.canUserPerformAction(createdBy, 'canCreateTasks')) {
          throw new ForbiddenException('Bu grupta görev oluşturma yetkiniz yok');
        }
      }

      // SLA hesaplama
      let slaDeadline: Date | undefined;
      if (createTaskDto.slaMinutes) {
        slaDeadline = new Date();
        slaDeadline.setMinutes(slaDeadline.getMinutes() + createTaskDto.slaMinutes);
      }

      const task = new this.taskModel({
        ...createTaskDto,
        createdBy: new Types.ObjectId(createdBy),
        assignedTo: createTaskDto.assignedTo 
          ? new Types.ObjectId(createTaskDto.assignedTo) 
          : undefined,
        groupId: createTaskDto.groupId 
          ? new Types.ObjectId(createTaskDto.groupId) 
          : undefined,
        dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : undefined,
        slaDeadline,
        activityLog: [{
          action: 'created',
          userId: new Types.ObjectId(createdBy),
          timestamp: new Date(),
          details: { title: createTaskDto.title }
        }]
      });

      const savedTask = await task.save();

      // Atanmış kişiye bildirim gönder
      if (createTaskDto.assignedTo && createTaskDto.assignedTo !== createdBy) {
        await this.notificationsService.createTaskAssignedNotification(
          createTaskDto.assignedTo,
          createTaskDto.title,
          createdBy,
          savedTask._id.toString(),
          createTaskDto.groupId
        );
      }

      // Müzik entegrasyonu varsa ayarla
      if (createTaskDto.musicSettings?.playlistId) {
        await this.musicService.mapTaskToMusic(createdBy, {
          taskId: savedTask._id.toString(),
          playlistId: createTaskDto.musicSettings.playlistId,
          provider: createTaskDto.musicSettings.provider as any,
          autoStart: createTaskDto.musicSettings.autoStart,
          autoStop: createTaskDto.musicSettings.autoStop,
        });
      }

      // Tekrarlanan görev ise sonraki görevleri oluştur
      if (createTaskDto.recurrenceType && createTaskDto.recurrenceType !== RecurrenceType.NONE) {
        await this.createRecurringTasks(savedTask, createTaskDto.recurrenceConfig);
      }

      // WebSocket ile gerçek zamanlı bildirim gönder
      const populatedTask = await this.findById(savedTask._id.toString());
      if (createTaskDto.groupId) {
        this.websocketGateway.emitToGroup(createTaskDto.groupId, 'task_created', {
          task: populatedTask,
          createdBy,
          message: `Yeni görev oluşturuldu: ${createTaskDto.title}`
        });
      }

      return populatedTask;
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      this.logger.error('Görev oluşturma hatası:', error);
      throw new BadRequestException('Görev oluşturulamadı');
    }
  }

  // Görevleri listeleme
  async findAll(filterDto: TaskFilterDto, userId: string): Promise<{
    tasks: Task[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      status,
      priority,
      assignedTo,
      createdBy,
      groupId,
      search,
      tags,
      dueDateFrom,
      dueDateTo,
      overdue,
      recurring,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = filterDto;

    const query: any = {};

    // Temel filtreler
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = new Types.ObjectId(assignedTo);
    if (createdBy) query.createdBy = new Types.ObjectId(createdBy);
    if (groupId) query.groupId = new Types.ObjectId(groupId);

    // Grup üyesi olmadığı görevleri filtreleme
    if (!groupId) {
      // Kullanıcının erişebileceği görevler: kendi oluşturduğu, kendisine atanan veya üyesi olduğu gruplardaki
      const userGroups = await this.groupsService.getUserGroups(userId);
      const groupIds = userGroups.map(g => new Types.ObjectId(g.id));
      
      query.$or = [
        { createdBy: new Types.ObjectId(userId) },
        { assignedTo: new Types.ObjectId(userId) },
        { groupId: { $in: groupIds } }
      ];
    }

    // Arama filtresi
    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      });
    }

    // Etiket filtresi
    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }

    // Tarih aralığı filtresi
    if (dueDateFrom || dueDateTo) {
      query.dueDate = {};
      if (dueDateFrom) query.dueDate.$gte = dueDateFrom;
      if (dueDateTo) query.dueDate.$lte = dueDateTo;
    }

    // Süresi geçenler
    if (overdue) {
      query.dueDate = { $lt: new Date() };
      query.status = { $ne: TaskStatus.COMPLETED };
    }

    // Tekrarlananlar
    if (recurring) {
      query.recurrenceType = { $ne: RecurrenceType.NONE };
    }

    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      this.taskModel
        .find(query)
        .populate('createdBy', 'firstName lastName email profileImage')
        .populate('assignedTo', 'firstName lastName email profileImage')
        .populate('groupId', 'name avatar')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.taskModel.countDocuments(query)
    ]);

    return { tasks, total, page, limit };
  }

  // ID ile görev bulma
  async findById(id: string): Promise<TaskDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Geçersiz görev ID');
    }

    const task = await this.taskModel
      .findById(id)
      .populate('createdBy', 'firstName lastName email profileImage')
      .populate('assignedTo', 'firstName lastName email profileImage')
      .populate('groupId', 'name avatar')
      .populate('comments.userId', 'firstName lastName profileImage')
      .exec();

    if (!task) {
      throw new NotFoundException('Görev bulunamadı');
    }

    return task;
  }

  // Görev güncelleme
  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string): Promise<Task> {
    const task = await this.findById(id);

    // Yetki kontrolü
    if (!(await this.canUserModifyTask(task, userId))) {
      throw new ForbiddenException('Bu görevi değiştirme yetkiniz yok');
    }

    const oldAssignee = task.assignedTo?.toString();
    const oldStatus = task.status;

    // Görev güncelleme
    Object.assign(task, updateTaskDto);
    if (updateTaskDto.assignedTo) {
      task.assignedTo = new Types.ObjectId(updateTaskDto.assignedTo);
    }
    if (updateTaskDto.dueDate) {
      task.dueDate = new Date(updateTaskDto.dueDate);
    }

    // Aktivite logu ekle
    task.activityLog.push({
      action: 'updated',
      userId: new Types.ObjectId(userId),
      timestamp: new Date(),
      details: updateTaskDto
    });

    const updatedTask = await task.save();

    // Atama değişikliği bildirimi
    if (updateTaskDto.assignedTo && oldAssignee !== updateTaskDto.assignedTo) {
      await this.notificationsService.createTaskAssignedNotification(
        updateTaskDto.assignedTo,
        task.title,
        userId,
        task._id.toString(),
        task.groupId?.toString()
      );
    }

    // Durum değişikliği bildirimi
    if (updateTaskDto.status && oldStatus !== updateTaskDto.status) {
      // WebSocket ile gerçek zamanlı bildirim gönder
      if (task.groupId) {
        this.websocketGateway.emitToGroup(task.groupId.toString(), 'task_updated', {
          task: await this.findById(updatedTask._id.toString()),
          updatedBy: userId,
          changes: { status: { from: oldStatus, to: updateTaskDto.status } },
          message: `Görev durumu güncellendi: ${task.title}`
        });
      }
    }

    return this.findById(updatedTask._id.toString());
  }

  // Görev tamamlama
  async complete(id: string, completeDto: CompleteTaskDto, userId: string): Promise<Task> {
    const task = await this.findById(id);

    if (!(await this.canUserModifyTask(task, userId))) {
      throw new ForbiddenException('Bu görevi tamamlama yetkiniz yok');
    }

    if (task.status === TaskStatus.COMPLETED) {
      throw new BadRequestException('Görev zaten tamamlanmış');
    }

    task.status = TaskStatus.COMPLETED;
    task.completedAt = new Date();
    task.completedBy = new Types.ObjectId(userId);
    
    if (completeDto.completionNote) {
      task.completionNote = completeDto.completionNote;
    }
    
    if (completeDto.actualTime) {
      task.actualTime = completeDto.actualTime;
    }

    // Aktivite logu ekle
    task.activityLog.push({
      action: 'completed',
      userId: new Types.ObjectId(userId),
      timestamp: new Date(),
      details: { note: completeDto.completionNote }
    });

    const completedTask = await task.save();

    // Tamamlama bildirimi gönder
    if (task.createdBy.toString() !== userId) {
      // Görev oluşturana bildir
    }

    // WebSocket ile gerçek zamanlı bildirim gönder
    if (task.groupId) {
      this.websocketGateway.emitToGroup(task.groupId.toString(), 'task_completed', {
        task: await this.findById(completedTask._id.toString()),
        completedBy: userId,
        message: `Görev tamamlandı: ${task.title}`,
        points: task.points || 0
      });
    }

    return this.findById(completedTask._id.toString());
  }

  // Yorum ekleme
  async addComment(taskId: string, commentDto: AddCommentDto, userId: string): Promise<Task> {
    const task = await this.findById(taskId);

    const comment = {
      _id: new Types.ObjectId(),
      content: commentDto.content,
      userId: new Types.ObjectId(userId),
      createdAt: new Date(),
      attachments: commentDto.attachments || [],
      replyTo: commentDto.replyTo ? new Types.ObjectId(commentDto.replyTo) : undefined
    };

    task.comments.push(comment as any);

    // Aktivite logu ekle
    task.activityLog.push({
      action: 'commented',
      userId: new Types.ObjectId(userId),
      timestamp: new Date(),
      details: { comment: commentDto.content }
    });

    await task.save();
    return this.findById(taskId);
  }

  // Görev silme
  async delete(id: string, userId: string): Promise<void> {
    const task = await this.findById(id);

    if (!(await this.canUserDeleteTask(task, userId))) {
      throw new ForbiddenException('Bu görevi silme yetkiniz yok');
    }

    await this.taskModel.findByIdAndDelete(id);
  }

  // Toplu güncelleme
  async bulkUpdate(bulkUpdateDto: BulkUpdateTasksDto, userId: string): Promise<void> {
    const tasks = await this.taskModel.find({
      _id: { $in: bulkUpdateDto.taskIds.map(id => new Types.ObjectId(id)) }
    });

    // Yetki kontrolü
    for (const task of tasks) {
      if (!(await this.canUserModifyTask(task, userId))) {
        throw new ForbiddenException(`Görev "${task.title}" için değiştirme yetkiniz yok`);
      }
    }

    const updateData: any = {};
    if (bulkUpdateDto.status) updateData.status = bulkUpdateDto.status;
    if (bulkUpdateDto.priority) updateData.priority = bulkUpdateDto.priority;
    if (bulkUpdateDto.assignedTo) updateData.assignedTo = new Types.ObjectId(bulkUpdateDto.assignedTo);
    if (bulkUpdateDto.dueDate) updateData.dueDate = new Date(bulkUpdateDto.dueDate);
    if (bulkUpdateDto.tags) updateData.tags = bulkUpdateDto.tags;

    await this.taskModel.updateMany(
      { _id: { $in: bulkUpdateDto.taskIds.map(id => new Types.ObjectId(id)) } },
      { $set: updateData }
    );
  }

  // İstatistikler
  async getStats(statsDto: TaskStatsDto, userId: string): Promise<any> {
    const {
      startDate,
      endDate,
      groupId,
      userId: targetUserId,
      groupByStatus,
      groupByPriority,
      groupByUser
    } = statsDto;

    const matchQuery: any = {};

    // Kullanıcı erişim filtresi
    if (!targetUserId && !groupId) {
      const userGroups = await this.groupsService.getUserGroups(userId);
      const groupIds = userGroups.map(g => new Types.ObjectId(g.id));
      
      matchQuery.$or = [
        { createdBy: new Types.ObjectId(userId) },
        { assignedTo: new Types.ObjectId(userId) },
        { groupId: { $in: groupIds } }
      ];
    }

    if (targetUserId) matchQuery.assignedTo = new Types.ObjectId(targetUserId);
    if (groupId) matchQuery.groupId = new Types.ObjectId(groupId);
    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = startDate;
      if (endDate) matchQuery.createdAt.$lte = endDate;
    }

    const pipeline: any[] = [{ $match: matchQuery }];

    if (groupByStatus) {
      pipeline.push(
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      );
    } else if (groupByPriority) {
      pipeline.push(
        { $group: { _id: '$priority', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      );
    } else if (groupByUser) {
      pipeline.push(
        { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $sort: { count: -1 } }
      );
    } else {
      pipeline.push({
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', TaskStatus.COMPLETED] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', TaskStatus.IN_PROGRESS] }, 1, 0] } },
          overdue: { $sum: { $cond: [{ $and: [
            { $ne: ['$status', TaskStatus.COMPLETED] },
            { $lt: ['$dueDate', new Date()] }
          ] }, 1, 0] } }
        }
      });
    }

    const results = await this.taskModel.aggregate(pipeline);
    return results;
  }

  // Yardımcı metodlar
  private async canUserModifyTask(task: TaskDocument, userId: string): Promise<boolean> {
    // Görev oluşturanı, atanmış kişi veya grup yöneticisi değiştirebilir
    return task.createdBy.toString() === userId ||
           task.assignedTo?.toString() === userId ||
           await this.canUserManageGroupTasks(task.groupId?.toString(), userId);
  }

  private async canUserDeleteTask(task: TaskDocument, userId: string): Promise<boolean> {
    // Sadece görev oluşturanı veya grup yöneticisi silebilir
    return task.createdBy.toString() === userId ||
           await this.canUserManageGroupTasks(task.groupId?.toString(), userId);
  }

  private async canUserManageGroupTasks(groupId: string | undefined, userId: string): Promise<boolean> {
    if (!groupId) return false;
    
    try {
      const group = await this.groupsService.findById(groupId);
      return group.canUserPerformAction(userId, 'canDeleteTasks');
    } catch {
      return false;
    }
  }

  // Tekrarlanan görevler oluşturma (stub)
  private async createRecurringTasks(task: TaskDocument, config: any): Promise<void> {
    // TODO: Tekrarlanan görevler için mantık implement et
    this.logger.log(`Recurring task setup for: ${task._id}`);
  }

  // SLA kontrolü ve uyarılar (Cron job için)
  async checkSLAWarnings(): Promise<void> {
    const now = new Date();
    const warningTime = new Date(now.getTime() + 30 * 60 * 1000); // 30 dakika sonra

    const tasks = await this.taskModel.find({
      status: { $ne: TaskStatus.COMPLETED },
      slaDeadline: { $lte: warningTime, $gt: now }
    }).populate('assignedTo');

    for (const task of tasks) {
      if (task.assignedTo) {
        await this.notificationsService.createTaskDueSoonNotification(
          task.assignedTo.toString(),
          task.title,
          task.slaDeadline,
          task._id.toString(),
          task.groupId?.toString()
        );
      }
    }
  }
}
