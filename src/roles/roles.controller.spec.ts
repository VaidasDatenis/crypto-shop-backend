import { Test, TestingModule } from "@nestjs/testing";
import { RolesController } from "./roles.controller";
import { RolesService } from "./roles.service";
import { JwtService } from "@nestjs/jwt";
import { UnauthorizedException } from "@nestjs/common";

describe('RolesController', () => {
  let controller: RolesController;
  let service: RolesService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: RolesService,
          useValue: {
            createRole: jest.fn(),
            updateRole: jest.fn(),
            deleteRole: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {},
        },
      ],
    }).compile();
    
    controller = module.get<RolesController>(RolesController);
    service = module.get<RolesService>(RolesService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should create a role admin, only by admin', async () => {
    const roleDto = {
      name: 'ADMIN',
      description: 'role-description'
    };
    const expectedRole = {
      ...roleDto,
      id: 'role-id',
    };
    jest.spyOn(service, 'createRole').mockResolvedValue(expectedRole);
    expect(await controller.createRole(roleDto, 'admin-user-id')).toBe(expectedRole);
  });

  it('should update a role', async () => {
    const roleId = 'role-id';
    const updateRoleDto = {
      name: 'UPDATED_ROLE',
      description: 'Updated role description',
    };
    const updatedRole = {
      ...updateRoleDto,
      id: roleId,
    };
    jest.spyOn(service, 'updateRole').mockResolvedValue(updatedRole);
    expect(await controller.updateRole(roleId, updateRoleDto, 'admin-user-id')).toBe(updatedRole);
  });

  it('should delete a role', async () => {
    const roleId = 'role-id';
    jest.spyOn(service, 'deleteRole').mockResolvedValue(undefined); // Assuming the delete operation doesn't return a value
    await expect(controller.deleteRole(roleId, 'admin-user-id')).resolves.toBe(undefined);
    expect(service.deleteRole).toHaveBeenCalledWith(roleId, 'admin-user-id');
  });

  it('should not create a role if the user is not admin', async () => {
  const roleDto = {
    name: 'USER',
    description: 'Non-admin role',
  };
  jest.spyOn(service, 'createRole').mockImplementation(async () => {
    throw new UnauthorizedException();
  });
  await expect(controller.createRole(roleDto, 'non-admin-user-id')).rejects.toThrow(UnauthorizedException);
});
});
