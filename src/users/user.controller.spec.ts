import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { RolesService } from 'src/roles/roles.service';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

describe('UsersController', () => {
  let controller: UserController;
  let userService: UserService;
  let rolesService: RolesService;
  let jwtService: JwtService;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            createUser: jest.fn(),
            findUserById: jest.fn(),
            updateUser: jest.fn(),
            createItemByUser: jest.fn(),
            softDeleteUserAndCleanup: jest.fn(),
          },
        },
        {
          provide: RolesService,
          useValue: {
            getRolesByUserId: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {},
        },
        {
          provide: Reflector,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
    rolesService = module.get<RolesService>(RolesService);
    jwtService = module.get<JwtService>(JwtService);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should call createUser with correct parameters', async () => {
    const createUserDto = new CreateUserDto();
    const requestorId = 'admin-user-id';
    // Simulate AuthRequest
    await controller.createUser(createUserDto, { user: { userId: requestorId } } as any);
    expect(userService.createUser).toHaveBeenCalledWith(createUserDto, requestorId);
  });

  it('should call findUserById with correct userId', async () => {
    const userId = 'test-user-id';
    await controller.findUserById(userId);
    expect(userService.findUserById).toHaveBeenCalledWith(userId);
  });

  it('should call updateUser with correct parameters', async () => {
    const userId = 'test-user-id';
    const updateUserDto = new UpdateUserDto();
    const requestorId = 'admin-user-id';
    await controller.updateUser(userId, updateUserDto, requestorId);
    expect(userService.updateUser).toHaveBeenCalledWith(userId, updateUserDto, requestorId);
  });

  it('should call getRolesByUserId with correct userId', async () => {
    const userId = 'test-user-id';
    await controller.getRolesByUserId(userId);
    expect(rolesService.getRolesByUserId).toHaveBeenCalledWith(userId);
  });

  it('should call softDeleteUserAndCleanup with the correct userId', async () => {
    const userId = 'test-user-id';
    await controller.removeUser(userId);
    expect(userService.softDeleteUserAndCleanup).toHaveBeenCalledWith(userId);
  });
});
