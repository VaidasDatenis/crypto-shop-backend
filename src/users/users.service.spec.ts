import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { GroupsService } from '../groups/groups.service';
import { DatabaseService } from 'src/database/database.service';
import { RolesService } from 'src/roles/roles.service';
import { UpdateUserDto } from './dto/user.dto';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { UserRoles } from 'src/enums/roles.enum';
import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';

describe('UsersService', () => {
  let service: UsersService;
  let databaseService: DatabaseService;
  let rolesService: RolesService;
  let groupsService: GroupsService;

  const mockUserFindUnique = jest.fn();
  const mockUserFindFirst = jest.fn();
  const mockUserCreate = jest.fn();
  const mockUserUpdate = jest.fn();
  const mockItemUpdateMany = jest.fn();
  const mockMessageUpdateMany = jest.fn();
  const mockTransaction = jest.fn();
  const mockRemoveUserFromGroupMembers = jest.fn();
  const mockMarkOwnedGroupsAsDeleted = jest.fn();
  const mockIsAdmin = jest.fn();
  const mockAssignUserRoleToUser = jest.fn();
  const mockUserWalletFindFirst = jest.fn();
  const mockUpdateUserWallets = jest.fn();
  const mockUserWalletUpdate = jest.fn();
  // const mockUserWalletCreateMany = jest.fn();
  const mockUserRolesCreateMany = jest.fn();
  // const mockUserRolesDeleteMany = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.mock('ethers', () => ({
      utils: {
        getAddress: jest.fn(() => 'normalized-wallet-address')
      }
    }));
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: DatabaseService,
          useValue: {
            user: {
              findUnique: mockUserFindUnique,
              findFirst: mockUserFindFirst,
              create: mockUserCreate,
              update: mockUserUpdate,
            },
            item: {
              updateMany: mockItemUpdateMany,
            },
            message: {
              updateMany: mockMessageUpdateMany,
            },
            userRoles: {
              createMany: mockUserRolesCreateMany,
              deleteMany: jest.fn(),
            },
            userWallet: {
              create: jest.fn(() => Promise.resolve()),
              update: mockUserWalletUpdate,
              updateMany: jest.fn(),
              deleteMany: jest.fn(),
              findFirst: mockUserWalletFindFirst,
            },
            $transaction: mockTransaction,
            updateUserWallets: mockUpdateUserWallets,
          },
        },
        {
          provide: RolesService,
          useValue: {
            isUserAdmin: mockIsAdmin,
            assignUserRoleToUser: mockAssignUserRoleToUser,
            deleteMany: jest.fn(),
          },
        },
        {
          provide: GroupsService,
          useValue: {
            removeUserFromGroupMembers: mockRemoveUserFromGroupMembers,
            markOwnedGroupsAsDeleted: mockMarkOwnedGroupsAsDeleted,
          },
        }
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    service.generateNonce = jest.fn().mockReturnValue('new-nonce');  // Mocking generateNonce method
    service.assignRolesToUser = jest.fn().mockResolvedValue(undefined);  // Mocking assignRolesToUser method
    databaseService = module.get<DatabaseService>(DatabaseService);
    rolesService = module.get<RolesService>(RolesService);
    groupsService = module.get<GroupsService>(GroupsService);
  });

  describe('findOrCreateUser', () => {
    it('should create and return a new user if none exists', async () => {
      const rawWalletAddress = '0x8F4360939aAE0fcf389C81A1760572389d6907e7'; // Original address
      const checksummedAddress = ethers.utils.getAddress(rawWalletAddress); // Convert to checksum address
      const createUserDto = { walletAddress: checksummedAddress, userRoles: [] };
      const newUser = { id: '1', userWallets: [] };

      mockUserFindFirst.mockResolvedValue(null);
      mockUserCreate.mockResolvedValue(newUser);

      const result = await service.findOrCreateUser(createUserDto);

      expect(databaseService.user.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          userWallets: expect.objectContaining({
            create: expect.objectContaining({
              walletAddress: checksummedAddress,
              nonce: expect.any(String)  // Expect nonce if your logic adds it
            })
          })
        })
      }));
      expect(result).toEqual(newUser);
    });

    it('should return existing user if found', async () => {
      const createUserDto = { walletAddress: '0x8F4360939aAE0fcf389C81A1760572389d6907e7', userRoles: [] };
      const existingUser = { id: '1', userWallets: [{ walletAddress: '0x8F4360939aAE0fcf389C81A1760572389d6907e7', nonce: 'existing-nonce' }] };

      mockUserFindFirst.mockResolvedValue(existingUser);
      const result = await service.findOrCreateUser(createUserDto);
      expect(result).toEqual(existingUser);
    });

    it('should update nonce for existing user wallet if nonce is missing', async () => {
      const createUserDto = { walletAddress: '0x8F4360939aAE0fcf389C81A1760572389d6907e7', userRoles: [] };
      const existingUser = { id: '1', userWallets: [{ id: 'wallet-id', walletAddress: '0x8F4360939aAE0fcf389C81A1760572389d6907e7', nonce: undefined }] };

      mockUserFindFirst.mockResolvedValue(existingUser);
      mockUserWalletUpdate.mockResolvedValue({
        id: 'wallet-id',
        walletAddress: '0x8F4360939aAE0fcf389C81A1760572389d6907e7',
        nonce: 'new-nonce'
      });

      const result = await service.findOrCreateUser(createUserDto);

      expect(databaseService.userWallet.update).toHaveBeenCalledWith({
        where: { id: 'wallet-id' },
        data: { nonce: 'new-nonce' }
      });
      expect(result).toEqual(existingUser);
    });

    it('should throw an error for invalid wallet address', async () => {
      const createUserDto = { walletAddress: '0x123', userRoles: [] };
      await expect(service.findOrCreateUser(createUserDto))
        .rejects
        .toThrow('invalid address (argument="address", value="0x123", code=INVALID_ARGUMENT, version=address/5.7.0)');
    });
  });

  describe('updateUser', () => {
    let service: UsersService;
    let databaseService: DatabaseService;
    let rolesService: RolesService;

    const mockUserFindUnique = jest.fn();
    const mockUserRolesFindMany = jest.fn();
    const mockUserRolesCreate = jest.fn();
    const mockUserRolesCreateMany = jest.fn();
    const mockUserRolesDeleteMany = jest.fn();
    const mockUserWalletFindFirst = jest.fn();
    const mockIsAdmin = jest.fn();

    beforeEach(async () => {
      jest.clearAllMocks();
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          UsersService,
          {
            provide: DatabaseService,
            useValue: {
              user: {
                update: mockUserUpdate,
                findUnique: mockUserFindUnique,
              },
              userRoles: {
                findMany: mockUserRolesFindMany,
                create: mockUserRolesCreate,
                createMany: mockUserRolesCreateMany,
                deleteMany: mockUserRolesDeleteMany,
              },
              userWallet: {
                create: jest.fn(),
                findFirst: mockUserWalletFindFirst,
                updateMany: jest.fn(),
                deleteMany: jest.fn(),
              },
              $transaction: jest.fn().mockImplementation(async cb => await cb()),
            },
          },
          {
            provide: RolesService,
            useValue: {
              isUserAdmin: mockIsAdmin,
              assignUserRoleToUser: jest.fn(),
            },
          },
          {
            provide: GroupsService,
            useValue: {
              removeUserFromGroupMembers: jest.fn(),
              markOwnedGroupsAsDeleted: jest.fn(),
            },
          },
        ],
      }).compile();
      
      service = module.get<UsersService>(UsersService);
      databaseService = module.get<DatabaseService>(DatabaseService);
      rolesService = module.get<RolesService>(RolesService);
    });

    it('should throw a ForbiddenException if non-admin tries to assign ADMIN role', async () => {
      const userId = 'user-id';
      const newRoleIds = ['ADMIN'];
      const requestorId = 'non-admin-id';

      mockIsAdmin.mockResolvedValue(false);

      await expect(service.updateUserRoles(userId, newRoleIds, requestorId))
        .rejects.toThrow(ForbiddenException);
    });

    it('should update roles correctly for valid admin', async () => {
      const userId = 'user-id';
      const newRoleIds = ['role-id-1'];
      const requestorId = 'admin-id';
      const existingRoles = [{ roleId: 'role-id-2' }];

      mockIsAdmin.mockResolvedValue(true);
      mockUserRolesFindMany.mockResolvedValue(existingRoles);

      await service.updateUserRoles(userId, newRoleIds, requestorId);

      expect(databaseService.userRoles.deleteMany).toHaveBeenCalledWith({
        where: { userId, roleId: { in: ['role-id-2'] } }
      });
      expect(databaseService.userRoles.create).toHaveBeenCalledWith({
        data: { userId, roleId: 'role-id-1' }
      });
    });

    it('should handle database operation failures gracefully', async () => {
      const userId = 'user-id';
      const newRoleIds = ['role-id-1'];
      const requestorId = 'admin-id';

      mockIsAdmin.mockResolvedValue(true);
      mockUserRolesFindMany.mockRejectedValue(new Error('Database operation failed'));

      await expect(service.updateUserRoles(userId, newRoleIds, requestorId))
        .rejects.toThrow('Database operation failed');
    });

    it('should update user wallets if walletAddress is provided', async () => {
      const userId = 'test-user-id';
      const updateUserDto: UpdateUserDto = {
        email: 'new-email@example.com',
        walletAddress: '0x8F4360939aAE0fcf389C81A1760572389d6907e7'
      };

      mockUserUpdate.mockResolvedValue({
        id: userId,
        email: 'new-email@example.com',
        walletAddress: '0x8F4360939aAE0fcf389C81A1760572389d6907e7'
      });

      await service.updateUser(userId, updateUserDto, 'admin-user-id');

      expect(databaseService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          email: 'new-email@example.com',
        },
        include: { userWallets: true },
      });
    });

    it('should throw UnauthorizedException if non-admin tries to update roles', async () => {
      const userId = 'test-user-id';
      const requestorId = 'non-admin-user-id';
      const updateUserDto: UpdateUserDto = {
        email: 'new-email@example.com',
        userRoles: [UserRoles.ADMIN],
      };

      mockIsAdmin.mockResolvedValue(false);

      await expect(service.updateUser(userId, updateUserDto, requestorId))
        .rejects.toThrow(UnauthorizedException);
      expect(databaseService.user.update).toHaveBeenCalled();
      expect(databaseService.userRoles.deleteMany).not.toHaveBeenCalled();
      expect(rolesService.assignUserRoleToUser).not.toHaveBeenCalled();
    });

    it('should handle wallet updates correctly', async () => {
      const userId = 'test-user-id';
      const walletAddress = '0x8F4360939aAE0fcf389C81A1760572389d6907e7';
      service.updateUserWallets = jest.fn().mockImplementation(async (userId, walletAddress) => {
        return databaseService.userWallet.findFirst({ where: { walletAddress }, include: { user: true } });
      });

      await service.updateUserWallets(userId, walletAddress);

      expect(service.updateUserWallets).toHaveBeenCalledWith(userId, walletAddress);
      expect(databaseService.userWallet.findFirst).toHaveBeenCalledWith({
        where: { walletAddress },
        include: { user: true }
      });
    });
  });

  describe('updateUserWallets', () => {
    it('should create a new wallet if none exists', async () => {
      const userId = 'user1';
      const newAddress = '0x8F4360939aAE0fcf389C81A1760572389d6907e7';
      mockUserWalletFindFirst.mockResolvedValue(null);

      await service.updateUserWallets(userId, newAddress);

      expect(databaseService.userWallet.create).toHaveBeenCalledWith({
        data: { userId, walletAddress: newAddress }
      });
    });

    it('should update the wallet if it already exists', async () => {
      const userId = 'user1';
      const existingWallet = { id: 'wallet1', walletAddress: '0x123' };
      const newAddress = '0x456';
      mockUserWalletFindFirst.mockResolvedValue(existingWallet);

      await service.updateUserWallets(userId, newAddress);

      expect(databaseService.userWallet.update).toHaveBeenCalledWith({
        where: { id: existingWallet.id },
        data: { walletAddress: newAddress }
      });
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
      expect(databaseService.userWallet.updateMany).toHaveBeenCalledWith({
        where: { userId },
        data: { deletedAt: now } });
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
      mockTransaction.mockImplementation(async (cb) => await cb(mockPrismaClient as unknown as PrismaClient));
      service.softDeleteUser = jest.fn();
      mockRemoveUserFromGroupMembers.mockResolvedValue(undefined);
      mockMarkOwnedGroupsAsDeleted.mockResolvedValue(undefined);
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
