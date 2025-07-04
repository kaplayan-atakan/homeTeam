import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { GroupsService } from './groups.service';
import { Group } from './group.schema';

describe('GroupsService', () => {
  let service: GroupsService;

  const mockGroup = {
    _id: new Types.ObjectId(),
    name: 'Test Grup',
    description: 'Test grubu',
    avatar: 'https://example.com/avatar.jpg',
    isPrivate: false,
    owner: new Types.ObjectId(),
    members: [],
    settings: {
      canMembersCreateTasks: true,
      canMembersAssignTasks: false,
      canMembersDeleteTasks: false,
      requireApprovalForTasks: false,
    },
    save: jest.fn().mockResolvedValue(true),
    canUserPerformAction: jest.fn().mockReturnValue(true),
  };

  const mockGroupModel = {
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
        exec: jest.fn().mockResolvedValue(mockGroup),
      }),
    }),
    find: jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockGroup]),
      }),
    }),
    findByIdAndUpdate: jest.fn().mockResolvedValue(mockGroup),
    findByIdAndDelete: jest.fn().mockResolvedValue(mockGroup),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupsService,
        {
          provide: getModelToken(Group.name),
          useValue: mockGroupModel,
        },
      ],
    }).compile();

    service = module.get<GroupsService>(GroupsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should return a group when found', async () => {
      const groupId = new Types.ObjectId().toString();
      const result = await service.findById(groupId);
      
      expect(result).toBeDefined();
      expect(mockGroupModel.findById).toHaveBeenCalledWith(groupId);
    });
  });

  describe('getUserGroups', () => {
    it('should return user groups', async () => {
      const userId = new Types.ObjectId().toString();
      const result = await service.getUserGroups(userId);
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
