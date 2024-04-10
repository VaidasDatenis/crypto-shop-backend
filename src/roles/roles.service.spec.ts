import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { DatabaseService } from 'src/database/database.service';
import { UserRoles } from 'src/enums/roles.enum';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { NotFoundException, UnauthorizedException, ForbiddenException } from '@nestjs/common';

describe('RolesService', () => {
  let service: RolesService;
  let databaseService: jest.Mocked<DatabaseService>;

  const mockRolesFindMany = jest.fn();
  const mockRoleCreate = jest.fn();
  const mockRoleFindUnique = jest.fn();
  const mockRoleUpdate = jest.fn();
  const mockGroupCount = jest.fn();
  const mockUserRolesDeleteMany = jest.fn();

  beforeEach(() => {
    mockRolesFindMany.mockReset().mockResolvedValue([]);
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: DatabaseService,
          useValue: {
            role: {
              findUnique: mockRoleFindUnique,
              create: mockRoleCreate,
              update: mockRoleUpdate,
              delete: jest.fn(),
            },
            userRoles: {
              findMany: mockRolesFindMany,
              upsert: jest.fn(),
              deleteMany: mockUserRolesDeleteMany,
            },
            group: {
              count: mockGroupCount,
            },
          },
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    databaseService = module.get(DatabaseService) as jest.Mocked<DatabaseService>;
  });

  describe('getRolesByUserId', () => {
    it('should return roles of a user', async () => {
      const userId = 'test-user-id';
      const mockRoles = [
        { role: { name: UserRoles.USER } },
        { role: { name: UserRoles.GROUP_OWNER } },
      ];
      mockRolesFindMany.mockResolvedValue(mockRoles);
      const roles = await service.getRolesByUserId(userId);
      expect(roles).toEqual(mockRoles.map(({ role }) => role));
      expect(databaseService.userRoles.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: { role: true },
      });
    });
  });

  describe('createRole', () => {
    it('should create a role when user is admin', async () => {
      const userId = 'admin-user-id';
      const createRoleDto: CreateRoleDto = {
        name: UserRoles.GROUP_MEMBER,
        description: 'Group member role',
      };
      jest.spyOn(service, 'isUserAdmin').mockResolvedValue(true);
      mockRoleCreate.mockResolvedValue(createRoleDto);
      const result = await service.createRole(createRoleDto, userId);
      expect(result).toEqual(createRoleDto);
      expect(service.isUserAdmin).toHaveBeenCalledWith(userId);
      expect(databaseService.role.create).toHaveBeenCalledWith({
        data: createRoleDto,
      });
    });

    it('should throw UnauthorizedException if user is not admin', async () => {
      const userId = 'regular-user-id';
      jest.spyOn(service, 'isUserAdmin').mockResolvedValue(false);
      await expect(service.createRole({ name: UserRoles.USER, description: 'Regular user role' }, userId)).rejects.toThrow(UnauthorizedException);
    });
  });

  // FindRoleByName
  describe('findRoleByName', () => {
    it('should return a role by name', async () => {
      const roleName = UserRoles.USER;
      const mockRole = { id: '1', name: roleName, description: 'A regular user' };
      mockRoleFindUnique.mockResolvedValue(mockRole);
      const result = await service.findRoleByName(roleName);
      expect(result).toEqual(mockRole);
      expect(databaseService.role.findUnique).toHaveBeenCalledWith({
        where: { name: roleName },
      });
    });

    it('should throw NotFoundException if role does not exist', async () => {
      mockRoleFindUnique.mockResolvedValue(null);
      await expect(service.findRoleByName('NON_EXISTENT_ROLE')).rejects.toThrow(NotFoundException);
    });
  });

  // IsUserAdmin
  describe('isUserAdmin', () => {
    it('should return true if user is an admin', async () => {
      const userId = 'admin-id';
      mockRolesFindMany.mockResolvedValue([{ role: { name: UserRoles.ADMIN } }]);
      const isAdmin = await service.isUserAdmin(userId);
      expect(isAdmin).toBeTruthy();
      expect(databaseService.userRoles.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: { role: true },
      });
    });

    it('should return false if user is not an admin', async () => {
      const userId = 'user-id';
      mockRolesFindMany.mockResolvedValue([{ role: { name: UserRoles.USER } }]);
      const isAdmin = await service.isUserAdmin(userId);
      expect(isAdmin).toBeFalsy();
    });
  });

  // UpdateRole
  describe('updateRole', () => {
    it('should update a role when requestor is admin', async () => {
      const roleId = '1';
      const requestorId = 'admin-id';
      const updateRoleDto: UpdateRoleDto = { name: 'UPDATED_ROLE', description: 'Updated role description' };
      jest.spyOn(service, 'isUserAdmin').mockResolvedValue(true);
      mockRoleFindUnique.mockResolvedValue({ id: roleId, ...updateRoleDto });
      mockRoleUpdate.mockResolvedValue({ id: roleId, ...updateRoleDto });
      const result = await service.updateRole(requestorId, roleId, updateRoleDto);
      expect(result).toEqual({ id: roleId, ...updateRoleDto });
      expect(service.isUserAdmin).toHaveBeenCalledWith(requestorId);
      expect(databaseService.role.update).toHaveBeenCalledWith({
        where: { id: roleId },
        data: updateRoleDto,
      });
    });

    it('should throw ForbiddenException if requestor is not admin', async () => {
      const requestorId = 'user-id';
      jest.spyOn(service, 'isUserAdmin').mockResolvedValue(false);
      await expect(service.updateRole(requestorId, '1', { name: 'ROLE', description: 'Role description' })).rejects.toThrow(ForbiddenException);
    });
  });

  // UpdateRolesAfterGroupDeletion
  describe('updateRolesAfterGroupDeletion', () => {
    it('should remove GROUP_OWNER role after group deletion if no owned groups remain', async () => {
      const userId = 'user-id';
      mockGroupCount.mockResolvedValue(0);
      jest.spyOn(service, 'findRoleByName').mockResolvedValue({ id: '2', name: UserRoles.GROUP_OWNER, description: 'Group owner description' });
      mockUserRolesDeleteMany.mockResolvedValue({ count: 1 });
      await service.updateRolesAfterGroupDeletion(userId);      
      expect(databaseService.userRoles.deleteMany).toHaveBeenCalledWith({
        where: { userId, roleId: '1', groupId: undefined },
      });
    });
  });

  // RemoveRoleFromUser
  describe('removeRoleFromUser', () => {
    it('should remove a role from a user', async () => {
      const userId = 'user-id';
      const roleName = UserRoles.USER;
      mockRoleFindUnique.mockResolvedValue({ id: '1', name: roleName });
      await service.removeRoleFromUser(userId, roleName);
      expect(databaseService.userRoles.deleteMany).toHaveBeenCalledWith({
        where: { userId, roleId: '1' },
      });
    });
  });

  // DeleteRole
  describe('deleteRole', () => {
    it('should delete a role when user is admin', async () => {
      const userId = 'admin-id';
      const roleId = 'role-id';
      jest.spyOn(service, 'isUserAdmin').mockResolvedValue(true);
      await service.deleteRole(roleId, userId);
      expect(databaseService.role.delete).toHaveBeenCalledWith({ where: { id: roleId } });
    });

    it('should throw UnauthorizedException when user is not admin', async () => {
      const userId = 'user-id';
      jest.spyOn(service, 'isUserAdmin').mockResolvedValue(false);
      await expect(service.deleteRole('role-id', userId)).rejects.toThrow(UnauthorizedException);
    });
  });
});
