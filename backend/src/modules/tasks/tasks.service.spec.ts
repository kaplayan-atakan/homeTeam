import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TasksService } from './tasks.service';
import { Task, TaskDocument, TaskStatus, TaskPriority } from './task.schema';
import { GroupsService } from '../groups/groups.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MusicService } from '../music/music.service';
import { WebsocketGateway } from '../../websocket/websocket.gateway';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';

describe('TasksService', () => {
  let service: TasksService;
  let taskModel: Model<TaskDocument>;
  let groupsService: GroupsService;
  let notificationsService: NotificationsService;
  let musicService: MusicService;
  let websocketGateway: WebsocketGateway;

  // Mock data
  const mockUserId = new Types.ObjectId().toString();
  const mockGroupId = new Types.ObjectId().toString();
  const mockTaskId = new Types.ObjectId().toString();

  const mockTask = {
    _id: new Types.ObjectId(mockTaskId),
    title: 'Test Görev',
    description: 'Test açıklaması',
    status: TaskStatus.PENDING,
    priority: TaskPriority.MEDIUM,
    assignedTo: new Types.ObjectId(mockUserId),
    createdBy: new Types.ObjectId(mockUserId),
    groupId: new Types.ObjectId(mockGroupId),
    slaMinutes: 1440,
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    completedAt: null,
    tags: ['test'],
    activityLog: [],
    comments: [],
    save: jest.fn().mockResolvedValue(true),
  };

  const mockGroup = {
    _id: new Types.ObjectId(mockGroupId),
    name: 'Test Grup',
    canUserPerformAction: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getModelToken(Task.name),
          useValue: jest.fn().mockImplementation((dto) => ({
            ...dto,
            _id: new Types.ObjectId(),
            save: jest.fn().mockResolvedValue({ ...dto, _id: new Types.ObjectId() }),
            toObject: jest.fn().mockReturnValue({ ...dto, _id: new Types.ObjectId() }),
            find: jest.fn(),
            findById: jest.fn().mockReturnValue({
              populate: jest.fn().mockReturnValue({
                populate: jest.fn().mockReturnValue({
                  populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockReturnValue({
                      exec: jest.fn().mockResolvedValue(mockTask),
                    }),
                  }),
                }),
              }),
            }),
            findByIdAndUpdate: jest.fn().mockResolvedValue({ ...mockTask, save: jest.fn().mockResolvedValue(true) }),
            findByIdAndDelete: jest.fn().mockResolvedValue(mockTask),
            create: jest.fn(),
            exec: jest.fn(),
            populate: jest.fn(),
            sort: jest.fn(),
            limit: jest.fn(),
            skip: jest.fn(),
            aggregate: jest.fn(),
            updateMany: jest.fn(),
          })),
        },
        {
          provide: GroupsService,
          useValue: {
            findById: jest.fn().mockResolvedValue(mockGroup),
            getUserGroups: jest.fn().mockResolvedValue([mockGroup]),
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            createTaskAssignedNotification: jest.fn().mockResolvedValue(true),
            createTaskCompletedNotification: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: MusicService,
          useValue: {
            mapTaskToMusic: jest.fn().mockResolvedValue(true),
            stopTaskMusic: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: WebsocketGateway,
          useValue: {
            emitToGroup: jest.fn(),
            emitToUser: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    taskModel = module.get<Model<TaskDocument>>(getModelToken(Task.name));
    groupsService = module.get<GroupsService>(GroupsService);
    notificationsService = module.get<NotificationsService>(NotificationsService);
    musicService = module.get<MusicService>(MusicService);
    websocketGateway = module.get<WebsocketGateway>(WebsocketGateway);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createTaskDto: CreateTaskDto = {
      title: 'Yeni Görev',
      description: 'Görev açıklaması',
      priority: TaskPriority.HIGH,
      assignedTo: mockUserId,
      groupId: mockGroupId,
      slaMinutes: 1440,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      tags: ['test', 'önemli'],
    };

    it('should create a task successfully', async () => {
      // Arrange
      const mockCreatedTask = { ...mockTask, ...createTaskDto, _id: new Types.ObjectId() };
      jest.spyOn(service, 'findById').mockResolvedValue(mockCreatedTask as any);

      // Act
      const result = await service.create(createTaskDto, mockUserId);

      // Assert
      expect(result).toBeDefined();
      expect(groupsService.findById).toHaveBeenCalledWith(mockGroupId);
      expect(mockGroup.canUserPerformAction).toHaveBeenCalledWith(mockUserId, 'canCreateTasks');
    });

    it('should throw ForbiddenException when user cannot create tasks in group', async () => {
      // Arrange
      mockGroup.canUserPerformAction.mockReturnValue(false);

      // Act & Assert
      await expect(service.create(createTaskDto, mockUserId))
        .rejects
        .toThrow(ForbiddenException);
    });

    it('should send notification when task is assigned to different user', async () => {
      // Arrange
      const differentUserId = new Types.ObjectId().toString();
      const createDtoWithDifferentUser = { ...createTaskDto, assignedTo: differentUserId };
      
      const taskModelInstance = {
        save: jest.fn().mockResolvedValue({ ...mockTask, assignedTo: differentUserId }),
      };
      (taskModel as any) = jest.fn().mockReturnValue(taskModelInstance);
      
      jest.spyOn(service, 'findById').mockResolvedValue(mockTask as any);

      // Act
      await service.create(createDtoWithDifferentUser, mockUserId);

      // Assert
      expect(notificationsService.createTaskAssignedNotification).toHaveBeenCalledWith(
        differentUserId,
        createDtoWithDifferentUser.title,
        mockUserId,
        expect.any(String),
        mockGroupId
      );
    });

    it('should emit WebSocket event to group', async () => {
      // Arrange
      const taskModelInstance = {
        save: jest.fn().mockResolvedValue({ ...mockTask, ...createTaskDto }),
      };
      (taskModel as any) = jest.fn().mockReturnValue(taskModelInstance);
      
      jest.spyOn(service, 'findById').mockResolvedValue(mockTask as any);

      // Act
      await service.create(createTaskDto, mockUserId);

      // Assert
      expect(websocketGateway.emitToGroup).toHaveBeenCalledWith(
        mockGroupId,
        'task_created',
        expect.objectContaining({
          task: expect.any(Object),
          createdBy: mockUserId,
          message: expect.stringContaining(createTaskDto.title)
        })
      );
    });

    it('should handle music integration if provided', async () => {
      // Arrange
      const createDtoWithMusic = {
        ...createTaskDto,
        musicSettings: {
          playlistId: 'test-playlist',
          provider: 'spotify' as const,
          autoStart: true,
          autoStop: false,
        }
      };

      const taskModelInstance = {
        save: jest.fn().mockResolvedValue({ ...mockTask, ...createDtoWithMusic }),
      };
      (taskModel as any) = jest.fn().mockReturnValue(taskModelInstance);
      
      jest.spyOn(service, 'findById').mockResolvedValue(mockTask as any);

      // Act
      await service.create(createDtoWithMusic, mockUserId);

      // Assert
      expect(musicService.mapTaskToMusic).toHaveBeenCalledWith(
        mockUserId,
        expect.objectContaining({
          taskId: expect.any(String),
          playlistId: 'test-playlist',
          provider: 'spotify',
          autoStart: true,
          autoStop: false,
        })
      );
    });
  });

  describe('findById', () => {
    it('should return task when found', async () => {
      // Arrange
      const populatedTask = { ...mockTask, populate: jest.fn().mockReturnThis() };
      taskModel.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(populatedTask)
            })
          })
        })
      });

      // Act
      const result = await service.findById(mockTaskId);

      // Assert
      expect(result).toBeDefined();
      expect(taskModel.findById).toHaveBeenCalledWith(mockTaskId);
    });

    it('should throw NotFoundException when task not found', async () => {
      // Arrange
      taskModel.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(null)
            })
          })
        })
      });

      // Act & Assert
      await expect(service.findById(mockTaskId))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid ObjectId', async () => {
      // Act & Assert
      await expect(service.findById('invalid-id'))
        .rejects
        .toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    const updateTaskDto: UpdateTaskDto = {
      title: 'Güncellenmiş Görev',
      description: 'Güncellenmiş açıklama',
      status: TaskStatus.IN_PROGRESS,
    };

    it('should update task successfully', async () => {
      // Arrange
      jest.spyOn(service, 'findById').mockResolvedValue(mockTask as any);
      jest.spyOn(service as any, 'canUserModifyTask').mockResolvedValue(true);
      
      const updatedTask = { ...mockTask, ...updateTaskDto };
      taskModel.findByIdAndUpdate = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(updatedTask)
            })
          })
        })
      });

      // Act
      const result = await service.update(mockTaskId, updateTaskDto, mockUserId);

      // Assert
      expect(result).toBeDefined();
      expect(result.title).toBe(updateTaskDto.title);
    });

    it('should throw ForbiddenException when user cannot modify task', async () => {
      // Arrange
      jest.spyOn(service, 'findById').mockResolvedValue(mockTask as any);
      jest.spyOn(service as any, 'canUserModifyTask').mockResolvedValue(false);

      // Act & Assert
      await expect(service.update(mockTaskId, updateTaskDto, mockUserId))
        .rejects
        .toThrow(ForbiddenException);
    });

    it('should emit WebSocket event when task updated', async () => {
      // Arrange
      jest.spyOn(service, 'findById').mockResolvedValue(mockTask as any);
      jest.spyOn(service as any, 'canUserModifyTask').mockResolvedValue(true);
      
      const updatedTask = { ...mockTask, ...updateTaskDto };
      taskModel.findByIdAndUpdate = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(updatedTask)
            })
          })
        })
      });

      // Act
      await service.update(mockTaskId, updateTaskDto, mockUserId);

      // Assert
      expect(websocketGateway.emitToGroup).toHaveBeenCalledWith(
        mockGroupId,
        'task_updated',
        expect.objectContaining({
          task: expect.any(Object),
          updatedBy: mockUserId
        })
      );
    });
  });

  describe('complete', () => {
    it('should complete task successfully', async () => {
      // Arrange
      const taskToComplete = { ...mockTask, status: TaskStatus.PENDING };
      jest.spyOn(service, 'findById').mockResolvedValue(taskToComplete as any);
      jest.spyOn(service as any, 'canUserModifyTask').mockResolvedValue(true);

      // Act
      const result = await service.complete(mockTaskId, {}, mockUserId);

      // Assert
      expect(taskToComplete.status).toBe(TaskStatus.COMPLETED);
      expect(taskToComplete.completedAt).toBeDefined();
      expect(taskToComplete.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException when task already completed', async () => {
      // Arrange
      const completedTask = { ...mockTask, status: TaskStatus.COMPLETED };
      jest.spyOn(service, 'findById').mockResolvedValue(completedTask as any);
      jest.spyOn(service as any, 'canUserModifyTask').mockResolvedValue(true);

      // Act & Assert
      await expect(service.complete(mockTaskId, {}, mockUserId))
        .rejects
        .toThrow(BadRequestException);
    });

    it('should emit task_completed event', async () => {
      // Arrange
      const taskToComplete = { ...mockTask, status: TaskStatus.PENDING };
      jest.spyOn(service, 'findById').mockResolvedValue(taskToComplete as any);
      jest.spyOn(service as any, 'canUserModifyTask').mockResolvedValue(true);

      // Act
      await service.complete(mockTaskId, {}, mockUserId);

      // Assert
      expect(websocketGateway.emitToGroup).toHaveBeenCalledWith(
        mockGroupId,
        'task_completed',
        expect.objectContaining({
          task: expect.any(Object),
          completedBy: mockUserId
        })
      );
    });
  });

  describe('delete', () => {
    it('should delete task successfully', async () => {
      // Arrange
      jest.spyOn(service, 'findById').mockResolvedValue(mockTask as any);
      jest.spyOn(service as any, 'canUserDeleteTask').mockResolvedValue(true);
      taskModel.findByIdAndDelete = jest.fn().mockResolvedValue(mockTask);

      // Act
      await service.delete(mockTaskId, mockUserId);

      // Assert
      expect(taskModel.findByIdAndDelete).toHaveBeenCalledWith(mockTaskId);
    });

    it('should throw ForbiddenException when user cannot delete task', async () => {
      // Arrange
      jest.spyOn(service, 'findById').mockResolvedValue(mockTask as any);
      jest.spyOn(service as any, 'canUserDeleteTask').mockResolvedValue(false);

      // Act & Assert
      await expect(service.delete(mockTaskId, mockUserId))
        .rejects
        .toThrow(ForbiddenException);
    });
  });
});
