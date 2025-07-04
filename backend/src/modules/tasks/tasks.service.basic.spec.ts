import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { TasksService } from './tasks.service';
import { Task, TaskStatus, TaskPriority } from './task.schema';
import { GroupsService } from '../groups/groups.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MusicService } from '../music/music.service';
import { WebsocketGateway } from '../../websocket/websocket.gateway';

describe('TasksService', () => {
  let service: TasksService;

  const mockTask = {
    _id: new Types.ObjectId(),
    title: 'Test Görev',
    description: 'Test görev açıklaması',
    status: TaskStatus.PENDING,
    priority: TaskPriority.MEDIUM,
    assignedTo: new Types.ObjectId(),
    createdBy: new Types.ObjectId(),
    groupId: new Types.ObjectId(),
    slaMinutes: 1440,
    dueDate: new Date(),
    save: jest.fn().mockResolvedValue(true),
  };

  const mockTaskModel = {
    new: jest.fn().mockImplementation((dto) => ({
      ...dto,
      _id: new Types.ObjectId(),
      save: jest.fn().mockResolvedValue({ ...dto, _id: new Types.ObjectId() }),
    })),
    constructor: jest.fn().mockImplementation((dto) => ({
      ...dto,
      _id: new Types.ObjectId(),
      save: jest.fn().mockResolvedValue({ ...dto, _id: new Types.ObjectId() }),
    })),
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
    findByIdAndUpdate: jest.fn().mockResolvedValue(mockTask),
    findByIdAndDelete: jest.fn().mockResolvedValue(mockTask),
  };

  const mockGroupsService = {
    findById: jest.fn().mockResolvedValue({
      _id: new Types.ObjectId(),
      name: 'Test Grup',
      canUserPerformAction: jest.fn().mockReturnValue(true),
    }),
  };

  const mockNotificationsService = {
    createTaskAssignedNotification: jest.fn().mockResolvedValue(true),
    createTaskCompletedNotification: jest.fn().mockResolvedValue(true),
  };

  const mockMusicService = {
    mapTaskToMusic: jest.fn().mockResolvedValue(true),
    stopTaskMusic: jest.fn().mockResolvedValue(true),
  };

  const mockWebsocketGateway = {
    emitToGroup: jest.fn(),
    emitToUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getModelToken(Task.name),
          useValue: mockTaskModel,
        },
        {
          provide: GroupsService,
          useValue: mockGroupsService,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
        {
          provide: MusicService,
          useValue: mockMusicService,
        },
        {
          provide: WebsocketGateway,
          useValue: mockWebsocketGateway,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should return a task when found', async () => {
      const taskId = new Types.ObjectId().toString();
      const result = await service.findById(taskId);
      
      expect(result).toBeDefined();
      expect(mockTaskModel.findById).toHaveBeenCalledWith(taskId);
    });
  });
});
