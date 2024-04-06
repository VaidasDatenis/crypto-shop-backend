import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/group.dto';
import { GetUser } from 'src/decorators/get-user.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { ExcludeSoftDeleted } from 'src/decorators/exclude-soft-deleted.decorator';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  @ExcludeSoftDeleted(true)
  findAllGroups() {
    return this.groupsService.findAllGroups();
  }

  @Get()
  @ExcludeSoftDeleted(true)
  findAllPublicGroups() {
    return this.groupsService.findAllPublicGroups();
  }

  @Get()
  @ExcludeSoftDeleted(true)
  findAllPrivateGroups() {
    return this.groupsService.findAllPrivateGroups();
  }

  @Post(':userId/group')
  @UseGuards(AuthGuard, RolesGuard)
  createGroupByUser(@Param('userId') userId: string, @Body() groupDto: CreateGroupDto) {
    return this.groupsService.createGroupByUser(groupDto, userId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  deleteGroup(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.groupsService.markOwnedGroupsAsDeleted(userId);
  }
}
