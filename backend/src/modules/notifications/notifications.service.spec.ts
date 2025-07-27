import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { NotificationsService } from './notifications.service';
import { Notification } from './notification.schema';

describe('NotificationsService', () => {
  let service: NotificationsService;

  const mockNotification = {
    _id: new Types.ObjectId(),
    userId: new Types.ObjectId(),
    type: 'task_assigned',
    title: 'Yeni Görev Atandı',
    message: 'Size yeni bir görev atandı',
    data: {},
    isRead: false,
    save: jest.fn().mockResolvedValue(true),
  };

  const mockNotificationModel = {
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
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([mockNotification]),
        }),
      }),
    }),
    findById: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockNotification),
    }),
    findByIdAndUpdate: jest.fn().mockResolvedValue(mockNotification),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getModelToken(Notification.name),
          useValue: mockNotificationModel,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTaskAssignedNotification', () => {
    it('should create task assigned notification', async () => {
      const userId = new Types.ObjectId().toString();
      const taskData = {
        taskId: new Types.ObjectId().toString(),
        taskTitle: 'Test Görevi',
        assignedBy: new Types.ObjectId().toString(),
      };

      const result = await service.createTaskAssignedNotification(
        userId, 
        taskData.taskId, 
        taskData.taskTitle, 
        taskData.assignedBy
      );
      
      expect(result).toBeDefined();
    });
  });

  describe('findUserNotifications', () => {
    it('should return user notifications', async () => {
      const userId = new Types.ObjectId().toString();
      const result = await service.findUserNotifications(userId, { page: 1, limit: 10 });
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
