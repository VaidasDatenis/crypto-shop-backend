import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateGroupDto, UpdateGroupDto } from './dto/group.dto';
import { DatabaseService } from 'src/database/database.service';
import { RolesService } from 'src/roles/roles.service';
import { UserRoles } from 'src/enums/roles.enum';
import { CreateItemDto } from 'src/items/dto/item.dto';
import { Item } from '@prisma/client';

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

  async getItemsByGroupId(groupId: string): Promise<Item[]> {
    const group = await this.databaseService.group.findUnique({
      where: { id: groupId, deletedAt: null },
      include: { items: true }
    });

    if (!group) {
      throw new NotFoundException(`Group with ID "${groupId}" not found.`);
    }

    if (!group.items.length) {
      return [];
    }
    return group.items;
  }

  async createGroupByUser(createGroupDto: CreateGroupDto, userId: string) {
    const isCreatingPublicGroup = createGroupDto.isPublic;
    const ownedGroupsCount = await this.databaseService.group.count({
      where: {
        ownerId: userId,
        isPublic: isCreatingPublicGroup,
        // exclude deleted groups
        deletedAt: null,
      },
    });
    if (ownedGroupsCount >= 1) {
      throw new HttpException(`User can own only one ${isCreatingPublicGroup ? 'public' : 'private'} group.`, HttpStatus.FORBIDDEN);
    }
    const newGroup = await this.databaseService.group.create({
      data: {
        ...createGroupDto,
        ownerId: userId,
      }
    });
    await this.rolesService.assignGroupRoleToUser(userId, UserRoles.GROUP_OWNER, newGroup.id);
    return newGroup;
  }

  async addUserToPublicGroup(userId: string, groupId: string) {
    const group = await this.databaseService.group.findUnique({ where: { id: groupId, isPublic: true, deletedAt: null } });
    if (!group) throw new Error('Group not found.');

    // Add user to group
    await this.databaseService.group.update({
      where: { id: groupId, isPublic: true, deletedAt: null },
      data: { members: { connect: { id: userId } } },
    });

    // Assign GROUP_MEMBER role
    await this.rolesService.assignGroupRoleToUser(userId, UserRoles.GROUP_MEMBER, groupId);
  }

  async updateGroup(groupId: string, userId: string, updateGroupDto: UpdateGroupDto) {
    const group = await this.databaseService.group.findUnique({ where: { id: groupId } });

    if (!group) {
      throw new NotFoundException(`Group with ID "${groupId}" not found.`);
    }

    if (group.ownerId !== userId) {
      throw new UnauthorizedException('You are not authorized to update this group.');
    }

    return this.databaseService.group.update({
      where: { id: groupId },
      data: updateGroupDto,
    });
  }

  async leaveGroupAsMember(groupId: string, userId: string): Promise<void> {
    const group = await this.databaseService.group.findUnique({
      where: { id: groupId, deletedAt: null },
      include: { members: true },
    });

    if (!group) {
      throw new NotFoundException(`Group with ID "${groupId}" not found.`);
    }

    if (!group.members.some(member => member.id === userId)) {
      throw new BadRequestException(`User is not a member of group with ID "${groupId}".`);
    }

    // Remove user from group members list
    await this.databaseService.group.update({
      where: { id: groupId, deletedAt: null },
      data: { members: { disconnect: { id: userId } } },
    });

    // Remove GROUP_MEMBER role for this specific group
    const memberships = await this.databaseService.group.findMany({
      where: { members: { some: { id: userId } }, deletedAt: null, NOT: { id: groupId } },
    });

    // remove the GROUP_MEMBER role
    if (memberships.length === 0) {
      await this.rolesService.removeGroupRoleFromUser(userId, UserRoles.GROUP_MEMBER, groupId);
    }
  }

  async addItemToGroup(userId: string, groupId: string, itemDto: CreateItemDto) {
    const group = await this.databaseService.group.findUnique({
      where: { id: groupId },
      include: { members: true, items: true },
    });

    if (!group || !group.isPublic) throw new NotFoundException('Group not found or is not public.');
    if (group.ownerId !== userId && !group.members.some(member => member.id === userId)) {
      throw new UnauthorizedException('User is not authorized to add items to this group.');
    }

    const itemLimit = group.ownerId === userId ? 5 : 3;
    if (group.items.length >= itemLimit) {
      throw new BadRequestException(`Item limit reached for the user in this group.`);
    }
    const convertedPrice = parseFloat(itemDto.price);
    return await this.databaseService.item.create({
      data: {
        ...itemDto,
        price: convertedPrice,
        groupId,
        sellerId: userId,
      },
    });
  }

  async removeItemFromGroup(itemId: string, groupId: string, userId: string): Promise<void> {
    const group = await this.databaseService.group.findUnique({
      where: { id: groupId, deletedAt: null },
    });
    if (!group) throw new NotFoundException(`Group with ID ${groupId} not found.`);
    
    const isAdmin = await this.rolesService.isUserAdmin(userId);
    if (!isAdmin && group.ownerId !== userId) {
      throw new UnauthorizedException('Only the group owner or an admin can remove items from this group.');
    }

    // Detach the item from the group
    await this.databaseService.item.update({
      where: { id: itemId },
      data: { groupId: null },
    });
  }

  async softDeleteItemFromGroup(itemId: string, groupId: string): Promise<void> {
    const item = await this.databaseService.item.findFirst({
      where: { id: itemId, groupId: groupId, deletedAt: null },
    });

    if (!item) {
      throw new NotFoundException(`Item with ID "${itemId}" not found in group "${groupId}".`);
    }

    await this.databaseService.item.update({
      where: { id: itemId },
      data: { deletedAt: new Date() },
    });
  }

  async removeUserFromGroup(userId: string, groupId: string) {
    await this.databaseService.group.update({
      where: { id: groupId },
      data: { members: { disconnect: { id: userId } } },
    });

    // Check if the user is a member of other groups
    const memberships = await this.databaseService.group.findMany({
      where: { members: { some: { id: userId } }, id: { not: groupId }, deletedAt: null },
    });

    // If the user is not a member of any other group, remove the GROUP_MEMBER role
    if (memberships.length === 0) {
      await this.rolesService.removeGroupRoleFromUser(userId, UserRoles.GROUP_MEMBER, groupId);
    }
  }

  async removeUserFromGroupMembers(userId: string): Promise<void> {
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

    await this.databaseService.group.update({
      where: { id: groupId },
      data: { deletedAt: new Date() },
    });

    await this.databaseService.item.updateMany({
      where: { groupId: groupId },
      data: { groupId: null },
    });

    await this.rolesService.updateGroupRolesAfterGroupDeletion(userId, groupId);
  };
}
