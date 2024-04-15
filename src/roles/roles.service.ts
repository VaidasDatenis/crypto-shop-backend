import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { DatabaseService } from 'src/database/database.service';
import { UserRoles } from 'src/enums/roles.enum';

@Injectable()
export class RolesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getRolesByUserId(userId: string): Promise<string[]> {
    const userRoles = await this.databaseService.userRoles.findMany({
      where: { userId, },
      include: { role: true },
    });
    const groupRoles = await this.databaseService.groupRoles.findMany({
      where: { userId },
      include: { role: true },
    });
    const roles = [...userRoles, ...groupRoles];
    return roles.map(({ role }) => role.name);
  }

  async findRoleByName(roleName: string) {
    const role = await this.databaseService.role.findUnique({
      where: {
        name: roleName,
      },
    });
    if (!role) throw new NotFoundException(`Role "${roleName}" not found`);
    return role;
  }

  async isUserAdmin(userId: string): Promise<boolean> {
    const userRoles = await this.databaseService.userRoles.findMany({
      where: { userId },
      include: { role: true },
    });

    return userRoles.some(({ role }) => role.name === UserRoles.ADMIN);
  }

  // Pivot table UserRoles
  async assignUserRoleToUser(userId: string, roleName: UserRoles) {
    const role = await this.databaseService.role.findUnique({ where: { name: roleName } });
    if (!role) throw new Error('Role not found.');

    await this.databaseService.userRoles.upsert({
      where: { userId_roleId: { userId, roleId: role.id } },
      update: {},
      create: { userId, roleId: role.id },
    });
  }

  // Pivot table GroupRoles
  async assignGroupRoleToUser(userId: string, roleName: UserRoles, groupId: string) {
    const role = await this.databaseService.role.findUnique({ where: { name: roleName } });
    if (!role) throw new Error('Role not found.');

    await this.databaseService.groupRoles.upsert({
      where: { userId_roleId_groupId: { userId, roleId: role.id, groupId } },
      update: {},
      create: { userId, roleId: role.id, groupId },
    });
  }

  async createRole(createRoleDto: CreateRoleDto, userId: string) {
    // Verify that the user is an ADMIN before allowing role creation
    const isAdmin = await this.isUserAdmin(userId);
    if (!isAdmin) {
      throw new UnauthorizedException('Only ADMIN users can create roles.');
    }
    return this.databaseService.role.create({
      data: createRoleDto
    });
  }

  async updateRole(requestorId: string, roleId: string, updateRoleDto: UpdateRoleDto) {
    // Check if the requestor has ADMIN privileges
    const isAdmin = await this.isUserAdmin(requestorId);
    if (!isAdmin) {
      throw new ForbiddenException('Only admins can update roles.');
    }

    // Find the role to ensure it exists before trying to update it
    const role = await this.databaseService.role.findUnique({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException(`Role with ID "${roleId}" not found.`);
    }

    return this.databaseService.role.update({
      where: { id: roleId },
      data: updateRoleDto,
    });
  }

  async updateGroupRolesAfterGroupDeletion(userId: string, groupId: string) {
    // Check if the user still owns any groups
    const ownedGroups = await this.databaseService.group.count({
      where: { ownerId: userId },
    });

    // If the user no longer owns any groups, remove the GROUP_OWNER role
    if (ownedGroups === 0) {
      const groupOwnerRole = await this.findRoleByName(UserRoles.GROUP_OWNER);
      await this.removeGroupRoleFromUser(userId, groupOwnerRole.name, groupId);
    }
  }

  async removeUserRoleFromUser(userId: string, roleName: string) {
    const role = await this.databaseService.role.findUnique({ where: { name: roleName } });
    if (!role) throw new Error('Role not found.');

    await this.databaseService.userRoles.deleteMany({
      where: { userId, roleId: role.id },
    });
  }

  async removeGroupRoleFromUser(userId: string, roleName: string, groupId: string) {
    const role = await this.databaseService.role.findUnique({ where: { name: roleName } });
    if (!role) throw new Error('Role not found.');

    await this.databaseService.groupRoles.deleteMany({
      where: { userId, roleId: role.id, groupId },
    });
  }

  async deleteRole(roleId: string, userId: string) {
    // Verify that the user is an ADMIN before allowing role deletion
    const userAdmin = await this.isUserAdmin(userId);
    if (!userAdmin) {
      throw new UnauthorizedException('Only ADMIN users can delete roles.');
    }

    return this.databaseService.role.delete({
      where: { id: roleId },
    });
  }
}
