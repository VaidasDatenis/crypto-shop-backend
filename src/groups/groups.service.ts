import { Injectable } from '@nestjs/common';
import { CreateGroupDto } from './dto/group.dto';
import { DatabaseService } from 'src/database/database.service';
import { RolesService } from 'src/roles/roles.service';
import { UserRoles } from 'src/enums/roles.enum';

@Injectable()
export class GroupsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly rolesService: RolesService,
  ) {}

  async findAllGroups() {
    return this.databaseService.group.findMany();
  }

  async findAllPublicGroups() {
    return this.databaseService.group.findMany({
      where: {
        isPublic: true,
      }
    })
  }

  async findAllPrivateGroups() {
    return this.databaseService.group.findMany({
      where: {
        isPublic: false,
      }
    })
  }

  async createGroupByUser(createGroupDto: CreateGroupDto, userId: string) {
    const newGroup = await this.databaseService.group.create({
      data: {
        ...createGroupDto,
        ownerId: userId,
      }
    });
    await this.rolesService.assignRolesToUser(userId, [UserRoles.GROUP_OWNER]);
    return newGroup;
  }

  // async joinPublicGroup(groupId: string, userId: string) {
  //   // Assuming logic to add the user to the group goes here

  //   // Automatically assign the GROUP_MEMBER role to the user
  //   await this.rolesService.assignRolesToUser(userId, [UserRoles.GROUP_MEMBER]);
  // }

  async removeUserFromGroupMembers(userId: string): Promise<void> {
    // Assuming a direct relation managed by Prisma, where `members` is a field on Group
    const memberships = await this.databaseService.group.findMany({
      where: {
        members: {
          some: { id: userId },
        },
      },
      select: { id: true },
    });

    await Promise.all(
      memberships.map(group =>
        this.databaseService.group.update({
          where: { id: group.id },
          data: {
            members: {
              disconnect: { id: userId },
            },
          },
        })
      )
    );
  }

  async markOwnedGroupsAsDeleted(ownerId: string) {
    await this.databaseService.group.updateMany({
      where: { ownerId },
      data: { deletedAt: new Date() },
    });
  }
}
