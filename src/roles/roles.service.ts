import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { DatabaseService } from 'src/database/database.service';
import { UserRoles } from 'src/enums/roles.enum';

@Injectable()
export class RolesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getRolesByUserId(userId: string) {
    const userRoles = await this.databaseService.userRoles.findMany({
      where: { userId, },
      include: { role: true },
    });
    return userRoles.map(ur => ur.role);
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

  // Pivot table UserRoles
  async assignRolesToUser(userId: string, roleNames: string[]) {
    // Iterate over each role name provided in the array
    for (const roleName of roleNames) {
      // Find the role by its name
      const role = await this.databaseService.role.findUnique({
        where: { name: roleName },
      });

      // If the role exists, create a new entry in the UserRoles pivot table
      if (role) {
        await this.databaseService.userRoles.create({
          data: {
            userId,
            roleId: role.id,
          },
        });
      } else {
        // Optionally handle the case where a role name does not match any existing roles
        console.warn(`Role not found with name: ${roleName}`);
      }
    }
  }

  async createRole(createRoleDto: CreateRoleDto, userId: string) {
    // Verify that the user is an ADMIN before allowing role creation
    const userRole = await this.databaseService.userRoles.findMany({
      where: { userId },
      include: { role: true }
    });
    if (!userRole.some(ur => ur.role.name === UserRoles.ADMIN)) {
      throw new UnauthorizedException('Only ADMIN users can create roles.');
    }
    return this.databaseService.role.create({
      data: createRoleDto
    });
  }

  // async updateRole(userId: string, roleId: string, updateRoleDto: UpdateRoleDto) {
  //   // For simplicity, assume that role updates by users only involve self-assignments to GROUP_OWNER or GROUP_MEMBER
  //   // Actual implementation may involve more complex checks
  //   const allowedRoles = ['GROUP_OWNER', 'GROUP_MEMBER'];
  //   if (!allowedRoles.includes(updateRoleDto.name)) {
  //     throw new UnauthorizedException('Users can only update to GROUP_OWNER or GROUP_MEMBER roles.');
  //   }

  //   // Implement logic to update user's role
  //   // This is a simplified placeholder for actual role update logic, which might involve user-specific checks
  // }

  async deleteRole(roleId: string, userId: string) {
    // Verify that the user is an ADMIN before allowing role deletion
    const userRoles = await this.databaseService.userRoles.findMany({
      where: { userId },
      include: { role: true }
    });
    if (!userRoles.some(ur => ur.role.name === 'ADMIN')) {
      throw new UnauthorizedException('Only ADMIN users can delete roles.');
    }

    return this.databaseService.role.delete({
      where: { id: roleId },
    });
  }
}
