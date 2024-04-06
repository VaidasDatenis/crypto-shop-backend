import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateItemDto } from './dto/item.dto';
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
    // Destructure the DTO to separate user data from roles, if they exist
    const { roles, ...userData } = createUserDto;
    // Create the user without roles first
    const newUser = await this.databaseService.user.create({
        data: userData,
    });
    // Determine the roles to be assigned
    let rolesToAssign = ['USER']; // Default role for all new users
    // If the requestorId is provided, check if the requestor is an ADMIN
    if (requestorId) {
      const requestorRoles = await this.rolesService.getRolesByUserId(requestorId);
      const isAdmin = requestorRoles.some(role => role.name === UserRoles.ADMIN);
      // If an ADMIN is creating the user and specific roles are provided, use those instead
      if (isAdmin && roles && roles.includes(UserRoles.ADMIN)) {
        rolesToAssign = roles;
      } else if (!isAdmin && roles && roles.includes(UserRoles.ADMIN)) {
        // Prevent non-ADMIN users from creating ADMIN users
        throw new ForbiddenException('Only ADMIN can assign ADMIN role.');
      }
    }
    // Assign the determined roles to the new user
    await this.rolesService.assignRolesToUser(newUser.id, rolesToAssign);
    return newUser;
  }

  async createItemByUser(createItemDto: CreateItemDto, userId: string) {
    return this.databaseService.item.create({
      data: {
        ...createItemDto,
        sellerId: userId,
      }
    })
  }

  async findAllUserItems(userId: string) {
    return this.databaseService.user.findUnique({
      where: { id: userId },
      include: { items: true },
    });
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
    const { roles, ...userData } = updateUserDto;
    // Check if the requestor has ADMIN privileges before allowing role updates
    const requestorRoles = await this.rolesService.getRolesByUserId(requestorId);
    const isAdmin = requestorRoles.some(role => role.name === UserRoles.ADMIN);

    // Update user data excluding roles
    const updatedUser = await this.databaseService.user.update({
      where: { id: userId },
      data: userData,
    });

    // If roles are provided and the requestor is ADMIN, update the user's roles
    if (roles && roles.length > 0 && isAdmin) {
      await this.databaseService.userRoles.deleteMany({
          where: { userId },
      });
      await this.rolesService.assignRolesToUser(userId, roles);
    } else if (roles && roles.length > 0) {
      throw new UnauthorizedException('Only ADMIN can update roles.');
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
