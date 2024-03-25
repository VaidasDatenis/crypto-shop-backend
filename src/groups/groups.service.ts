import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateGroupDto, UpdateGroupDto } from './dto/group.dto';
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

  async deleteGroupByOwner(groupId: string, userId: string) {
    const group = await this.databaseService.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException(`Group with ID "${groupId}" not found.`);
    }

    if (group.ownerId !== userId) {
      throw new UnauthorizedException('You are not authorized to delete this group.');
    }

    await this.databaseService.group.delete({
      where: { id: groupId },
    });
  }
}
