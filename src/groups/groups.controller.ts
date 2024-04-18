import { Controller, Get, Post, Body, Param, Delete, UseGuards, Patch } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto, UpdateGroupDto } from './dto/group.dto';
import { GetUser } from 'src/decorators/get-user.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { ExcludeSoftDeleted } from 'src/decorators/exclude-soft-deleted.decorator';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRoles } from 'src/enums/roles.enum';
import { CreateItemDto } from 'src/items/dto/item.dto';
import { Public } from 'src/auth/constants';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Public()
  @Get('all')
  @ExcludeSoftDeleted(true)
  findAllGroups() {
    return this.groupsService.findAllGroups();
  }

  @Public()
  @Get('public')
  @ExcludeSoftDeleted(true)
  findAllPublicGroups() {
    return this.groupsService.findAllPublicGroups();
  }

  @Public()
  @Get('private')
  @ExcludeSoftDeleted(true)
  findAllPrivateGroups() {
    return this.groupsService.findAllPrivateGroups();
  }

  @Get(':groupId/items')
  @Roles(UserRoles.ADMIN, UserRoles.GROUP_OWNER, UserRoles.GROUP_MEMBER)
  @UseGuards(AuthGuard)
  @ExcludeSoftDeleted(true)
  async findAllItemsInGroup(@Param('groupId') groupId: string) {
    return this.groupsService.getItemsByGroupId(groupId);
  }

  @Delete(':groupId/items/:itemId/remove')
  @Roles(UserRoles.ADMIN, UserRoles.GROUP_OWNER)
  @UseGuards(AuthGuard, RolesGuard)
  async removeItemFromGroup(
    @Param('groupId') groupId: string,
    @Param('itemId') itemId: string,
    @GetUser('id') userId: string,
  ) {
    await this.groupsService.removeItemFromGroup(itemId, groupId, userId);
    return { status: 201, message: 'Item removed from the group successfully.' };
  }

  @Post(':userId/group')
  @Roles(UserRoles.ADMIN, UserRoles.USER)
  @UseGuards(AuthGuard, RolesGuard)
  createGroupByUser(@Param('userId') userId: string, @Body() groupDto: CreateGroupDto) {
    return this.groupsService.createGroupByUser(groupDto, userId);
  }

  @Post(':groupId/join')
  @Roles(UserRoles.USER)
  @UseGuards(AuthGuard)
  async joinPublicGroup(@Param('groupId') groupId: string, @GetUser('id') userId: string) {
    await this.groupsService.addUserToPublicGroup(userId, groupId);
    return { status: 201, message: 'User added to the public group successfully.' };
  }

  @Post(':groupId/leave')
  @Roles(UserRoles.ADMIN, UserRoles.GROUP_MEMBER)
  @UseGuards(AuthGuard, RolesGuard)
  async leaveGroupAsMember(@Param('groupId') groupId: string, @GetUser('id') userId: string) {
    await this.groupsService.leaveGroupAsMember(groupId, userId);
    return { status: 201, message: 'Successfully left the group.' };
  }

  @Post(':groupId/item')
  @Roles(UserRoles.ADMIN, UserRoles.GROUP_OWNER, UserRoles.GROUP_MEMBER)
  @UseGuards(AuthGuard)
  async addItem(@GetUser('id') userId: string, @Param('groupId') groupId: string, @Body() createItemDto: CreateItemDto) {
    return await this.groupsService.addItemToGroup(userId, groupId, createItemDto);
  }

  @Post(':groupId/remove-member/:memberId')
  @Roles(UserRoles.ADMIN, UserRoles.GROUP_OWNER)
  @UseGuards(AuthGuard, RolesGuard)
  async removeMemberFromGroup(@Param('groupId') groupId: string, @Param('memberId') memberId: string) {
    await this.groupsService.removeUserFromGroup(memberId, groupId);
    return { status: 201, message: 'Successfully removed a member.' };
  }

  @Patch(':groupId')
  @Roles(UserRoles.ADMIN, UserRoles.GROUP_OWNER)
  @UseGuards(AuthGuard, RolesGuard)
  updateGroup(
    @Param('groupId') groupId: string,
    @Body() updateGroupDto: UpdateGroupDto,
    @GetUser('id') userId: string,
  ) {
    return this.groupsService.updateGroup(groupId, userId, updateGroupDto);
  }

  @Delete(':groupId')
  @Roles(UserRoles.ADMIN, UserRoles.GROUP_OWNER)
  @UseGuards(AuthGuard, RolesGuard)
  async deleteGroup(@Param('groupId') groupId: string, @GetUser('id') userId: string) {
    await this.groupsService.deleteGroupByOwner(groupId, userId);
    return { status: 201, message: 'Group deleted successfully.' };
  }
}
