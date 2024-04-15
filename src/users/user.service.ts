import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { RolesService } from 'src/roles/roles.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { UserRoles } from 'src/enums/roles.enum';
import { GroupsService } from 'src/groups/groups.service';

@Injectable()
export class UserService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly rolesService: RolesService,
    private readonly groupsService: GroupsService,
  ) {}

  async createUser(createUserDto: CreateUserDto, requestorId?: string) {
    const { userRoles = [], ...userData } = createUserDto;
    const newUser = await this.databaseService.user.create({
        data: userData,
    });
    // Determine the roles to be assigned
    let rolesToAssign: UserRoles[] = [UserRoles.USER];
    if (requestorId) {
      const isAdmin = await this.rolesService.isUserAdmin(requestorId);
      if (isAdmin && userRoles.includes(UserRoles.ADMIN)) {
        rolesToAssign = userRoles.map(role => {
          if (Object.values(UserRoles).includes(role as UserRoles)) {
            return role as UserRoles;
          }
          throw new Error(`Invalid role: ${role}`);
        });
      } else if (!isAdmin && userRoles && userRoles.includes(UserRoles.ADMIN)) {
        throw new ForbiddenException('Only ADMIN can assign ADMIN role.');
      }
    }
    // Assign the determined roles to the new user
    await Promise.all(rolesToAssign.map(roleName => 
      this.rolesService.assignUserRoleToUser(newUser.id, roleName)
    ));
    return newUser;
  }

  async findUserById(userId: string) {
    return this.databaseService.user.findUnique({
      where: { id: userId }
    })
  }

  async findUserByWalletAddress(walletAddress: string) {
    return this.databaseService.user.findUnique({
      where: { walletAddress }
    })
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto, requestorId: string) {
    const { userRoles, ...userData } = updateUserDto;
    // Update user data first
    const updatedUser = await this.databaseService.user.update({
      where: { id: userId },
      data: userData,
    });
    // Only proceed with role updates if roles are provided
    if (userRoles && userRoles.length > 0) {
      const isAdmin = await this.rolesService.isUserAdmin(requestorId);

      if (!isAdmin) {
        throw new UnauthorizedException('Only ADMIN can update roles.');
      }
      // Clear existing roles
      await this.databaseService.userRoles.deleteMany({
        where: { userId },
      });
      // Assign new roles
      for (const roleName of userRoles) {
        if (!Object.values(UserRoles).includes(roleName as UserRoles)) {
          throw new Error(`Invalid role: ${roleName}`);
        } else {
          await this.rolesService.assignUserRoleToUser(userId, roleName as UserRoles);
        }
      }
    }
    return updatedUser;
  }

  async softDeleteUser(userId: string) {
    const now = new Date();
    await this.databaseService.user.update({
      where: { id: userId },
      data: { deletedAt: now },
    });
    // Cascade the soft delete to items & messages
    await this.databaseService.item.updateMany({
      where: { sellerId: userId },
      data: { deletedAt: now },
    });

    await this.databaseService.message.updateMany({
      where: { fromId: userId },
      data: { deletedAt: now },
    });
  }

  async softDeleteUserAndCleanup(userId: string): Promise<void> {
    await this.databaseService.$transaction(async () => {
      await this.softDeleteUser(userId);
      await this.groupsService.removeUserFromGroupMembers(userId);
      await this.groupsService.markOwnedGroupsAsDeleted(userId);
    });
  }
}
