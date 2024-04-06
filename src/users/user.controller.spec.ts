import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { RolesService } from 'src/roles/roles.service';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';

describe('UsersController', () => {
  let controller: UserController;
  let service: UserService;
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
    service = module.get<UserService>(UserService);
    rolesService = module.get<RolesService>(RolesService);
    jwtService = module.get<JwtService>(JwtService);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should call softDeleteUserAndCleanup with the correct userId', async () => {
    const userId = 'test-user-id';
    await controller.removeUser(userId);
    expect(service.softDeleteUserAndCleanup).toHaveBeenCalledWith(userId);
  });
});
