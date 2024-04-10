import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { GroupsService } from '../groups/groups.service';
import { DatabaseService } from 'src/database/database.service';
import { RolesService } from 'src/roles/roles.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { UnauthorizedException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UserRoles } from 'src/enums/roles.enum';
import { PrismaClient } from '@prisma/client';

jest.mock('../database/database.service', () => {
  return {
    DatabaseService: jest.fn().mockImplementation(() => ({
      user: {
        create: jest.fn(),
        update: jest.fn(),
      },
      item: {
        updateMany: jest.fn(),
      },
      message: {
        updateMany: jest.fn(),
      },
      $transaction: jest.fn(),
    })),
  };
});
jest.mock('../roles/roles.service');
jest.mock('../groups/groups.service', () => {
  return {
    GroupsService: jest.fn().mockImplementation(() => ({
      removeUserFromGroupMembers: jest.fn(),
      markOwnedGroupsAsDeleted: jest.fn(),
    })),
  };
});

describe('UserService', () => {
  let service: UserService;
  let databaseService: jest.Mocked<DatabaseService>;
  let rolesService: jest.Mocked<RolesService>;
  let groupsService: jest.Mocked<GroupsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, DatabaseService, RolesService, GroupsService],
    }).compile();
    service = module.get<UserService>(UserService);
    databaseService = module.get(DatabaseService);
    (databaseService.user.create as jest.Mock).mockClear();
    (databaseService.user.update as jest.Mock).mockClear();
    rolesService = module.get(RolesService);
    groupsService = module.get(GroupsService);
    
    rolesService.isUserAdmin.mockResolvedValue(true);
  });

  describe('createUser', () => {
    it('should successfully create a user with default USER role', async () => {
      (databaseService.user.create as jest.Mock).mockImplementation(async (dto: { data: CreateUserDto }) => ({
        id: 'mockUserId',
        ...dto.data,
      }));
      const createUserDto: CreateUserDto = {
        walletAddress: '0x001',
        walletNames: ['0x0002'],
        email: 'user-email@example.com',
      };
      rolesService.assignRoleToUser.mockResolvedValueOnce(undefined);
      const result = await service.createUser(createUserDto, undefined);
      expect(result).toMatchObject(createUserDto);
      expect(rolesService.assignRoleToUser).toHaveBeenCalledWith(expect.any(String), UserRoles.USER);
    });
  });

  describe('updateUser', () => {
    it('should successfully update user details', async () => {
      const userId = 'mockUserId';
      const updateUserDto: UpdateUserDto = { email: 'updated@example.com' };
      (databaseService.user.update as jest.Mock).mockResolvedValue({
        id: userId,
        ...updateUserDto,
      });
      const result = await service.updateUser(userId, updateUserDto, 'adminUserId');
      expect(result).toEqual({
        id: userId,
        ...updateUserDto,
      });
    });

    it('should throw UnauthorizedException if non-admin tries to update roles', async () => {
      const userId = 'mockUserId';
      const requestorId = 'nonAdminUserId';
      const updateUserDto: UpdateUserDto = { roles: ['ADMIN'] };
      rolesService.isUserAdmin.mockResolvedValue(false);
      await expect(service.updateUser(userId, updateUserDto, requestorId)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('softDeleteUser', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      const now = new Date();
      jest.useFakeTimers().setSystemTime(now);
      databaseService.user.update = jest.fn().mockResolvedValueOnce({ id: 'test-user-id', deletedAt: now });
      databaseService.item.updateMany = jest.fn().mockResolvedValueOnce({ id: 'test-user-id', deletedAt: now });
      databaseService.message.updateMany = jest.fn().mockResolvedValueOnce({ id: 'test-user-id', deletedAt: now });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should mark user, their items, and messages as deleted', async () => {
      const userId = 'test-user-id';
      const now = new Date();
      await service.softDeleteUser(userId);
      expect(databaseService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { deletedAt: now },
      });
      expect(databaseService.item.updateMany).toHaveBeenCalledWith({
        where: { sellerId: userId },
        data: { deletedAt: now },
      });
      expect(databaseService.message.updateMany).toHaveBeenCalledWith({
        where: { fromId: userId },
        data: { deletedAt: now },
      });
    });
  });

  describe('softDeleteUserAndCleanup', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      const mockPrismaClient = {
        user: {
          update: jest.fn().mockResolvedValue({}),
        },
        item: {
          updateMany: jest.fn().mockResolvedValue({}),
        },
      };
      databaseService.$transaction.mockImplementation(async (cb) => await cb(mockPrismaClient as unknown as PrismaClient));
      service.softDeleteUser = jest.fn();
      groupsService.removeUserFromGroupMembers.mockResolvedValue(undefined);
      groupsService.markOwnedGroupsAsDeleted.mockResolvedValue(undefined);
    });

    it('should call softDeleteUser and group cleanup methods', async () => {
      const userId = 'test-user-id';
      await service.softDeleteUserAndCleanup(userId);
      expect(databaseService.$transaction).toHaveBeenCalled();
      expect(service.softDeleteUser).toHaveBeenCalledWith(userId);
      expect(groupsService.removeUserFromGroupMembers).toHaveBeenCalledWith(userId);
      expect(groupsService.markOwnedGroupsAsDeleted).toHaveBeenCalledWith(userId);
    });
});

});
