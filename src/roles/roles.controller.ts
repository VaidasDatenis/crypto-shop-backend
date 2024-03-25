import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesGuard } from 'src/guards/roles.guard';
import { UserRoles } from 'src/enums/roles.enum';
import { GetUser } from 'src/decorators/get-user.decorator';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @Roles(UserRoles.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  createRole(@Body() createRoleDto: CreateRoleDto, @GetUser('id') userId: string) {
    return this.rolesService.createRole(createRoleDto, userId);
  }

  // // Simplified for demonstration; actual implementation may vary
  // @Patch(':roleId')
  // updateRole(@Param('roleId') roleId: string, @Body() updateRoleDto: UpdateRoleDto, @GetUser('id') userId: string) {
  //   return this.rolesService.updateRole(userId, roleId, updateRoleDto);
  // }

  @Delete(':roleId')
  @Roles(UserRoles.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  deleteRole(@Param('roleId') roleId: string, @GetUser('id') userId: string) {
    return this.rolesService.deleteRole(roleId, userId);
  }
}
