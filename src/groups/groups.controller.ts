import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto, UpdateGroupDto } from './dto/group.dto';
import { GetUser } from 'src/decorators/get-user.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  findAllGroups() {
    return this.groupsService.findAllGroups();
  }

  @Get()
  findAllPublicGroups() {
    return this.groupsService.findAllPublicGroups();
  }

  @Get()
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
    return this.groupsService.deleteGroupByOwner(id, userId);
  }
}
