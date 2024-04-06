import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { GroupsService } from '../groups/groups.service';
import { DatabaseService } from 'src/database/database.service';
import { RolesService } from 'src/roles/roles.service';

describe('UsersService', () => {
  let service: UserService;
  let prismaService: DatabaseService;
  let groupsService: GroupsService;
  let rolesService: RolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: DatabaseService,
          useValue: {
            user: {
              update: jest.fn(),
            },
            item: {
              updateMany: jest.fn(),
            },
            message: {
              updateMany: jest.fn(),
            },
            $transaction: jest.fn((cb) => cb()),
          },
        },
        {
          provide: GroupsService,
          useValue: {
            removeUserFromGroupMembers: jest.fn(),
            markOwnedGroupsAsDeleted: jest.fn(),
          },
        },
        {
          provide: RolesService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<DatabaseService>(DatabaseService);
    groupsService = module.get<GroupsService>(GroupsService);
    rolesService = module.get<RolesService>(RolesService);
  });

  it('softDeleteUser should mark user, their items, and messages as deleted', async () => {
    const now = new Date();
    const userId = 'test-user-id';
    jest.useFakeTimers().setSystemTime(now);

    await service.softDeleteUser(userId);

    expect(prismaService.user.update).toHaveBeenCalledWith({
      where: { id: userId },
      data: { deletedAt: now },
    });
    expect(prismaService.item.updateMany).toHaveBeenCalledWith({
      where: { sellerId: userId },
      data: { deletedAt: now },
    });
    expect(prismaService.message.updateMany).toHaveBeenCalledWith({
      where: { fromId: userId },
      data: { deletedAt: now },
    });

    jest.useRealTimers();
  });

  it('softDeleteUserAndCleanup should call softDeleteUser and group cleanup methods', async () => {
    const userId = 'test-user-id';
    await service.softDeleteUserAndCleanup(userId);

    expect(prismaService.$transaction).toHaveBeenCalled();
    expect(groupsService.removeUserFromGroupMembers).toHaveBeenCalledWith(userId);
    expect(groupsService.markOwnedGroupsAsDeleted).toHaveBeenCalledWith(userId);
  });
});
