import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './users.controller';
import { UsersService } from './users.service';
import { RolesService } from 'src/roles/roles.service';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { AuthRequest } from 'src/interfaces.ts/auth-request.interface';

describe('UsersController', () => {
  let controller: UserController;
  let usersService: UsersService;
  let rolesService: RolesService;
  let jwtService: JwtService;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findOrCreateUser: jest.fn(),
            findUserById: jest.fn(),
            updateUser: jest.fn(),
            deleteUser: jest.fn(),
            createItemByUser: jest.fn(),
            softDeleteUserAndCleanup: jest.fn(),
          },
        },
        {
          provide: RolesService,
          useValue: {},
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
    usersService = module.get<UsersService>(UsersService);
    rolesService = module.get<RolesService>(RolesService);
    jwtService = module.get<JwtService>(JwtService);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should call createUser with correct parameters', async () => {
    const createUserDto = new CreateUserDto();
    const mockRequest = { user: { userId: 'admin-user-id' } };
    await controller.findOrCreateUser(createUserDto, mockRequest as AuthRequest);
    expect(usersService.findOrCreateUser).toHaveBeenCalledWith(createUserDto, 'admin-user-id');
  });

  it('should call findUserById with correct userId', async () => {
    const userId = 'test-user-id';
    await controller.findUserById(userId);
    expect(usersService.findUserById).toHaveBeenCalledWith(userId);
  });

  it('should call updateUser with correct parameters', async () => {
    const userId = 'test-user-id';
    const requestorId = 'test-requestor-id';
    const updateUserDto = new UpdateUserDto();
    await controller.updateUser(userId, updateUserDto, requestorId);
    expect(usersService.updateUser).toHaveBeenCalledWith(userId, updateUserDto, requestorId);
  });

  it('should call softDeleteUserAndCleanup with the correct userId', async () => {
    const userId = 'test-user-id';
    await controller.removeUser(userId);
    expect(usersService.softDeleteUserAndCleanup).toHaveBeenCalledWith(userId);
  });
});
