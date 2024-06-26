import { Test, TestingModule } from '@nestjs/testing';
import { GroupsService } from './groups.service';
import { DatabaseService } from '../database/database.service';
import { RolesService } from '../roles/roles.service';
import { NotFoundException, UnauthorizedException, BadRequestException, HttpException } from '@nestjs/common';
import { CreateGroupDto, UpdateGroupDto } from './dto/group.dto';
import { UserRoles } from 'src/enums/roles.enum';
import { JwtService } from '@nestjs/jwt';

describe('GroupsService', () => {
  let service: GroupsService;
  let databaseService: jest.Mocked<DatabaseService>;
  let rolesService: jest.Mocked<RolesService>;
  let jwtService: JwtService;

  const mockGroupFindMany = jest.fn();
  const mockGroupFindUnique = jest.fn();
  const mockGroupCount = jest.fn();
  const mockGroupCreate = jest.fn();
  const mockGroupUpdate = jest.fn();
  const mockGroupDelete = jest.fn();
  const mockAssignUserRoleToUser = jest.fn();
  const mockItemCreate = jest.fn();
  const mockItemUpdate = jest.fn();

  beforeEach(() => {
    mockGroupFindMany.mockReset().mockResolvedValue([]);
    mockGroupFindUnique.mockReset().mockResolvedValue(null);
    mockGroupCount.mockReset().mockResolvedValue(0);
    mockGroupCreate.mockReset().mockResolvedValue(null);
    mockGroupUpdate.mockReset().mockResolvedValue(null);
    mockGroupDelete.mockReset().mockResolvedValue(null);
    mockAssignUserRoleToUser.mockReset().mockResolvedValue(null);
    mockItemCreate.mockReset().mockResolvedValue(null);
    mockItemUpdate.mockReset().mockResolvedValue(null);
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupsService,
        {
          provide: DatabaseService,
          useValue: {
            group: {
              findMany: mockGroupFindMany,
              findUnique: mockGroupFindUnique,
              create: mockGroupCreate,
              count: mockGroupCount,
              update: mockGroupUpdate,
              delete: mockGroupDelete,
            },
            item: {
              create: mockItemCreate,
              update: mockItemUpdate,
            },
          },
        },
        {
          provide: RolesService,
          useValue: {
            assignUserRoleToUser: jest.fn(),
            assignGroupRoleToUser: jest.fn(),
            removeUserRoleFromUser: jest.fn(),
            removeGroupRoleFromUser: jest.fn(),
            isUserAdmin: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<GroupsService>(GroupsService);
    databaseService = module.get(DatabaseService) as jest.Mocked<DatabaseService>;
    rolesService = module.get(RolesService) as jest.Mocked<RolesService>;
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should add an item to the group successfully', async () => {
    const userId = 'user-id';
    const groupId = 'group-id';
    const itemDto = {
      title: 'New Item',
      description: 'Item description',
      price: '100',
      currency: 'USD',
      sellerId: userId,
    };
    const groupMock = {
      id: groupId,
      isPublic: true,
      ownerId: userId,
      members: [{ id: userId }],
      items: [],
    };
    const newItem = {
      ...itemDto,
      price: parseFloat(itemDto.price),
      groupId,
      sellerId: userId,
    };
    mockGroupFindUnique.mockResolvedValue(groupMock);
    mockItemCreate.mockResolvedValue(newItem);
    const result = await service.addItemToGroup(userId, groupId, itemDto);
    expect(databaseService.group.findUnique).toHaveBeenCalledWith({
      where: { id: groupId },
      include: { members: true, items: true },
    });
    expect(databaseService.item.create).toHaveBeenCalledWith({
      data: newItem,
    });
    expect(result).toEqual(newItem);
  });

  it('should throw NotFoundException if group is not found or not public', async () => {
    const userId = 'user-id';
    const groupId = 'group-id';
    const itemDto = {
      title: 'New Item',
      description: 'Item description',
      price: '100',
      currency: 'USD',
      sellerId: userId,
    };
    mockGroupFindUnique.mockResolvedValue(null);
    await expect(service.addItemToGroup(userId, groupId, itemDto)).rejects.toThrow(NotFoundException);
  });

  it('should throw UnauthorizedException if user is not the owner nor a member of the group', async () => {
    const userId = 'user-id';
    const groupId = 'group-id';
    const itemDto = {
      title: 'New Item',
      description: 'Item description',
      price: '100',
      currency: 'USD',
      sellerId: userId,
    };
    const groupMock = {
      id: groupId,
      isPublic: true,
      ownerId: 'another-user-id',
      members: [],
      items: [],
    };
    mockGroupFindUnique.mockResolvedValue(groupMock);
    await expect(service.addItemToGroup(userId, groupId, itemDto)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw BadRequestException if item limit for the group is reached', async () => {
    const userId = 'user-id';
    const groupId = 'group-id';
    const itemDto = {
      title: 'New Item',
      description: 'Item description',
      price: '100',
      currency: 'USD',
      sellerId: userId,
    };
    // Mocking group with itemLimit reached scenario
    const groupMock = {
      id: groupId,
      isPublic: true,
      ownerId: userId,
      members: [{ id: userId }],
      items: new Array(5).fill({}),
    };
    mockGroupFindUnique.mockResolvedValue(groupMock);
    await expect(service.addItemToGroup(userId, groupId, itemDto)).rejects.toThrow(BadRequestException);
  });

  it('should remove an item from a group if user is admin', async () => {
    const itemId = 'test-item-id';
    const groupId = 'test-group-id';
    const userId = 'test-user-id';
    const groupMock = { id: groupId, ownerId: 'another-user-id' }; // Mock group where user is not the owner
    const isAdmin = true; // Simulate user is an admin

    mockGroupFindUnique.mockResolvedValue(groupMock);
    rolesService.isUserAdmin.mockResolvedValue(isAdmin);

    await service.removeItemFromGroup(itemId, groupId, userId);

    expect(databaseService.group.findUnique).toHaveBeenCalledWith({ where: { id: groupId, deletedAt: null } });
    expect(databaseService.item.update).toHaveBeenCalledWith({
      where: { id: itemId },
      data: { groupId: null },
    });
  });

  it('should throw UnauthorizedException if user is not the group owner or an admin', async () => {
    const itemId = 'test-item-id';
    const groupId = 'test-group-id';
    const userId = 'test-user-id';
    const groupMock = { id: groupId, ownerId: 'another-user-id' }; // Mock group where user is not the owner
    const isAdmin = false; // Simulate user is not an admin

    mockGroupFindUnique.mockResolvedValue(groupMock);
    rolesService.isUserAdmin.mockResolvedValue(isAdmin);

    await expect(service.removeItemFromGroup(itemId, groupId, userId)).rejects.toThrow(UnauthorizedException);
  });

  it('should find all groups', async () => {
    mockGroupFindMany.mockResolvedValue([]);
    const result = await service.findAllGroups();
    expect(result).toEqual([]);
    expect(databaseService.group.findMany).toHaveBeenCalled();
  });

  it('should return only public groups', async () => {
    mockGroupFindMany.mockResolvedValueOnce([{ id: '1', isPublic: true }]);
    const result = await service.findAllPublicGroups();
    expect(result).toEqual([{ id: '1', isPublic: true }]);
    expect(mockGroupFindMany).toHaveBeenCalledWith({
      where: { isPublic: true }
    });
  });

  it('should return only private groups', async () => {
    mockGroupFindMany.mockResolvedValueOnce([{ id: '2', isPublic: false }]);
    const result = await service.findAllPrivateGroups();
    expect(result).toEqual([{ id: '2', isPublic: false }]);
    expect(mockGroupFindMany).toHaveBeenCalledWith({
      where: { isPublic: false }
    });
  });

  it('should create a group by user', async () => {
    const userId = 'test-user-id';
    const groupId = 'group-id';
    const createGroupDto: CreateGroupDto = {
      name: 'Pet Toys Store',
      description: 'All the toys for our pets!',
      isPublic: true,
      imageUrl: null,
      ownerId: userId,
    };
    const ownedGroupsCount = 0;
    const newGroup = {
      ...createGroupDto,
      id: groupId,
    };

    mockGroupCount.mockResolvedValue(ownedGroupsCount);
    mockGroupCreate.mockResolvedValue(newGroup);
    rolesService.assignGroupRoleToUser.mockResolvedValue(null);

    const result = await service.createGroupByUser(createGroupDto, userId);

    expect(databaseService.group.count).toHaveBeenCalledWith({
      where: {
        ownerId: userId,
        isPublic: createGroupDto.isPublic,
        deletedAt: null,
      },
    });
    expect(databaseService.group.create).toHaveBeenCalledWith({
      data: {
        ...createGroupDto,
        ownerId: userId,
      },
    });
    expect(rolesService.assignGroupRoleToUser).toHaveBeenCalledWith(userId, UserRoles.GROUP_OWNER, groupId);
    expect(result).toEqual(newGroup);
  });

  it('should not create more than one public/private group per user', async () => {
    const userId = 'test-user-id';
    const createGroupDto: CreateGroupDto = {
      name: 'Pet Toys Store',
      description: 'All the toys for our pets!',
      isPublic: true,
      imageUrl: null,
      ownerId: userId,
    };
    // Assuming user already owns a group
    mockGroupCount.mockResolvedValue(1);
    await expect(service.createGroupByUser(createGroupDto, userId)).rejects.toThrow(HttpException);
  });

  it('should add user to the public group and assign GROUP_MEMBER role', async () => {
    const groupId = 'groupId';
    const userId = 'userId';
    mockGroupFindUnique.mockResolvedValueOnce({
      id: groupId,
      isPublic: true,
      deletedAt: null
    });
    rolesService.assignUserRoleToUser.mockResolvedValueOnce(undefined);
    await service.addUserToPublicGroup(userId, groupId);
    expect(mockGroupUpdate).toHaveBeenCalledWith({
      where: { id: groupId, isPublic: true, deletedAt: null },
      data: { members: { connect: { id: userId } } },
    });
    expect(rolesService.assignGroupRoleToUser).toHaveBeenCalledWith(userId, UserRoles.GROUP_MEMBER, groupId);
  });

  it('should update a group', async () => {
    const groupId = 'test-group-id';
    const userId = 'test-owner-id';
    const updateGroupDto: UpdateGroupDto = {
      description: 'All the toys (from other people) for our pets!',
    };
    // Mocking the group owned by the user
    mockGroupFindUnique.mockResolvedValue({ ownerId: userId });
    await expect(service.updateGroup(groupId, userId, updateGroupDto)).resolves.not.toThrow();
    expect(databaseService.group.update).toHaveBeenCalledWith({
      where: { id: groupId },
      data: updateGroupDto,
    });
  });

  it('should remove user from group members list and remove GROUP_MEMBER role if no other memberships exist', async () => {
    const groupId = 'test-group-id';
    const userId = 'test-user-id';
    const groupMock = {
      id: groupId,
      members: [{ id: userId }],
    };
    const membershipsMock = [];
  
    mockGroupFindUnique.mockResolvedValue(groupMock);
    mockGroupUpdate.mockResolvedValue(null);
    mockGroupFindMany.mockResolvedValue(membershipsMock);
    rolesService.removeGroupRoleFromUser.mockResolvedValue(null);
  
    await service.leaveGroupAsMember(groupId, userId);
  
    expect(databaseService.group.findUnique).toHaveBeenCalledWith({
      where: { id: groupId, deletedAt: null },
      include: { members: true },
    });
    expect(databaseService.group.update).toHaveBeenCalledWith({
      where: { id: groupId, deletedAt: null },
      data: { members: { disconnect: { id: userId } } },
    });
    expect(databaseService.group.findMany).toHaveBeenCalledWith({
      where: { members: { some: { id: userId } }, deletedAt: null, NOT: { id: groupId } },
    });
    expect(rolesService.removeGroupRoleFromUser).toHaveBeenCalledWith(userId, UserRoles.GROUP_MEMBER, groupId);
  });
  
  it('should throw NotFoundException if group is not found', async () => {
    const groupId = 'test-group-id';
    const userId = 'test-user-id';
  
    mockGroupFindUnique.mockResolvedValue(null);
    await expect(service.leaveGroupAsMember(groupId, userId)).rejects.toThrow(NotFoundException);
  });
  
  it('should throw BadRequestException if user is not a member of the group', async () => {
    const groupId = 'test-group-id';
    const userId = 'test-user-id';
    const groupMock = {
      id: groupId,
      members: [],
    };
  
    mockGroupFindUnique.mockResolvedValue(groupMock);
    await expect(service.leaveGroupAsMember(groupId, userId)).rejects.toThrow(BadRequestException);
  });
});
