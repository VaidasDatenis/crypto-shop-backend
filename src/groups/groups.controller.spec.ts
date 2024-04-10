import { Test, TestingModule } from '@nestjs/testing';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';
import { CreateGroupDto, UpdateGroupDto } from './dto/group.dto';
import { JwtService } from '@nestjs/jwt';
import { CreateItemDto } from 'src/items/dto/item.dto';
import { Prisma } from '@prisma/client';

describe('GroupsController', () => {
  let controller: GroupsController;
  let service: jest.Mocked<GroupsService>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupsController],
      providers: [
        {
          provide: GroupsService,
          useValue: {
            findAllGroups: jest.fn(),
            findAllPublicGroups: jest.fn(),
            findAllPrivateGroups: jest.fn(),
            removeItemFromGroup: jest.fn(),
            createGroupByUser: jest.fn(),
            addItemToGroup: jest.fn(),
            addUserToPublicGroup: jest.fn(),
            leaveGroupAsMember: jest.fn(),
            removeUserFromGroup: jest.fn(),
            updateGroup: jest.fn(),
            deleteGroupByOwner: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<GroupsController>(GroupsController);
    service = module.get(GroupsService) as jest.Mocked<GroupsService>;
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should return all groups', async () => {
    const result = [];
    service.findAllGroups.mockResolvedValue(result);
    expect(await controller.findAllGroups()).toBe(result);
  });

  it('should return all public groups', async () => {
    const result = [];
    service.findAllPublicGroups.mockResolvedValue(result);
    expect(await controller.findAllPublicGroups()).toBe(result);
  });

  it('should remove an item from a group successfully', async () => {
    const groupId = 'test-group-id';
    const itemId = 'test-item-id';
    const userId = 'test-user-id';

    const response = await controller.removeItemFromGroup(groupId, itemId, userId);

    expect(response).toEqual({ status: 201, message: 'Item removed from the group successfully.' });
    expect(service.removeItemFromGroup).toHaveBeenCalledWith(itemId, groupId, userId);
  });

  it('should add an item to a group successfully', async () => {
    const userId = 'test-user-id';
    const groupId = 'test-group-id';
    const createItemDto: CreateItemDto = {
      title: 'Test Item',
      description: 'Test Description',
      images: null,
      price: '10',
      currency: 'Dai',
      sellerId: userId,
    };
    const expectedResponse = {
      id: 'item-id',
      title: 'Test Item',
      description: 'Test Description',
      images: null,
      price: new Prisma.Decimal('10.00'),
      currency: 'Dai',
      sellerId: userId,
      groupId: groupId,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
    service.addItemToGroup.mockResolvedValue(expectedResponse);
    const response = await controller.addItem(userId, groupId, createItemDto);
    expect(response).toEqual(expectedResponse);
    expect(service.addItemToGroup).toHaveBeenCalledWith(userId, groupId, createItemDto);
  });

  it('should create a group by user', async () => {
    const userId = 'test-user-id';
    const groupDto: CreateGroupDto = {
      name: 'Pet Toys Store',
      description: 'All the toys for our pets!',
      isPublic: true,
      imageUrl: null,
      ownerId: userId,
    };
    const result = {
      id: '111-222-333',
      name: 'Pet Toys Store',
      description: 'All the toys for our pets!',
      isPublic: true,
      imageUrl: null,
      ownerId: userId,
      items: [],
      members: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
    service.createGroupByUser.mockResolvedValue(result);
    expect(await controller.createGroupByUser(userId, groupDto)).toBe(result);
  });

  it('should join a public group', async () => {
    const userId = 'test-user-id';
    const groupId = 'test-group-id';
    await controller.joinPublicGroup(groupId, userId);
    expect(service.addUserToPublicGroup).toHaveBeenCalledWith(userId, groupId);
  });

  it('should leave a group as member', async () => {
    const userId = 'test-user-id';
    const groupId = 'test-group-id';
    await controller.leaveGroupAsMember(groupId, userId);
    expect(service.leaveGroupAsMember).toHaveBeenCalledWith(groupId, userId);
  });

  it('should remove a member from a group', async () => {
    const groupId = 'test-group-id';
    const memberId = 'test-member-id';
    await controller.removeMemberFromGroup(groupId, memberId);
    expect(service.removeUserFromGroup).toHaveBeenCalledWith(memberId, groupId);
  });

  it('should update a group', async () => {
    const groupId = 'test-group-id';
    const userId = 'test-user-id';
    // Populate with required fields
    const updateGroupDto: UpdateGroupDto = {
      description: 'All the toys (from other people) for our pets!',
    };
    await controller.updateGroup(groupId, updateGroupDto, userId);
    expect(service.updateGroup).toHaveBeenCalledWith(groupId, userId, updateGroupDto);
  });

  it('should delete a group', async () => {
    const groupId = 'test-group-id';
    const userId = 'test-user-id';
    await controller.deleteGroup(groupId, userId);
    expect(service.deleteGroupByOwner).toHaveBeenCalledWith(groupId, userId);
  });
});
