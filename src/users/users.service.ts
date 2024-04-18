import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { RolesService } from 'src/roles/roles.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { UserRoles } from 'src/enums/roles.enum';
import { GroupsService } from 'src/groups/groups.service';
import { User, UserWallet } from '@prisma/client';
import { ethers } from 'ethers';
import { randomBytes } from 'crypto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class UsersService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly rolesService: RolesService,
    private readonly groupsService: GroupsService,
  ) {}

  /**
   * handle all creation logic for both users and wallets, ensuring that the entire user setup,
   * including wallet creation and nonce generation, is managed in a controlled and predictable manner.
   */
  async findOrCreateUser(createUserDto: CreateUserDto, requestorId?: string) {
    const { userRoles = [], walletAddress, ...userData } = createUserDto;
    if (!walletAddress) {
      throw new Error('Wallet address is required');
    }

    const normalizedAddress = ethers.utils.getAddress(walletAddress);

    // Attempt to find the user by wallet address
    let user = await this.databaseService.user.findFirst({
      where: { userWallets: { some: { walletAddress: normalizedAddress } } },
      include: { userWallets: true }
    });

    // If the user does not exist, create a new one along with the wallet
    if (!user) {
      const newUser = await this.databaseService.user.create({
        data: {
          ...userData,
          userWallets: {
            create: {
              walletAddress: normalizedAddress,
              nonce: this.generateNonce(),
            }
          }
        },
      });
      // Assign roles
      await this.assignRolesToUser(newUser.id, userRoles, requestorId);
      return newUser;
    }

    // If the user exists but the wallet does not have a nonce, update it
    const userWallet = user.userWallets.find(w => w.walletAddress === normalizedAddress);
    if (userWallet && !userWallet.nonce) {
      await this.databaseService.userWallet.update({
        where: { id: userWallet.id },
        data: { nonce: this.generateNonce() }
      });
    }
    return user;
  }

  async assignRolesToUser(userId: string, rolesIds: string[], requestorId: string) {
    // Check if the requestor is an admin
    const isAdmin = await this.rolesService.isUserAdmin(requestorId);
    if (!isAdmin && rolesIds.includes(UserRoles.ADMIN)) {
      throw new ForbiddenException('Only ADMIN can assign ADMIN role.');
    }

    const existingRoles = await this.databaseService.userRoles.findMany({
      where: { userId },
      select: { roleId: true }
    });

    const existingRoleIds = existingRoles.map(role => role.roleId);
    const rolesToAdd = rolesIds.filter(roleId => !existingRoleIds.includes(roleId));

    await Promise.all(rolesToAdd.map(roleId => {
      return this.databaseService.userRoles.create({
        data: { userId, roleId }
      });
    }));
  }

  async findUserById(userId: string) {
    return this.databaseService.user.findUnique({
      where: { id: userId },
    })
  }

  async findUserByWalletAddress(walletAddress: string): Promise<User | null> {
    return this.databaseService.user.findFirst({
      where: {
        deletedAt: null,
        userWallets: {
          some: {
            walletAddress
          }
        }
      }
    });
  }

  async findAllActiveUsers(): Promise<User[]> {
    return this.databaseService.user.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        userWallets: {
          where: {
            deletedAt: null,
          },
        },
      },
    });
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto, requestorId?: string): Promise<User> {
    const { userRoles, walletAddress, ...userData } = updateUserDto;
    try {
      return await this.databaseService.$transaction(async () => {
        // Update user data first
        const updatedUser = await this.databaseService.user.update({
          where: { id: userId },
          data: userData,
          include: { userWallets: true },
        });

        // Update the wallet address if provided
        if (walletAddress) {
          await this.updateUserWallets(userId, walletAddress);
        }

        // Only proceed with role updates if roles are provided and requester is admin
        if (userRoles && userRoles.length > 0) {
          const isAdmin = await this.rolesService.isUserAdmin(requestorId);
          if (!isAdmin) {
            throw new UnauthorizedException('Only ADMIN can update roles.');
          }
          // Efficiently update roles
          await this.updateUserRoles(userId, userRoles, requestorId);
        }

        // Return the updated user with potentially new roles and wallet info
        return this.databaseService.user.findUnique({
          where: { id: userId },
          include: { userWallets: true, userRoles: true },
        });
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        // Handle specific errors from Prisma
        throw new BadRequestException('Database error occurred');
      }
      throw error;
    }
  }

  async updateUserRoles(userId: string, newRoleIds: string[], requestorId: string): Promise<void> {
    const isAdmin = await this.rolesService.isUserAdmin(requestorId);
    if (!isAdmin && newRoleIds.includes(UserRoles.ADMIN)) {
      throw new ForbiddenException('Only ADMIN can assign ADMIN role.');
    }

    let existingRoles;
    try {
      existingRoles = await this.databaseService.userRoles.findMany({
        where: { userId },
        select: { roleId: true }
      });
    } catch (error) {
      throw new Error('Database operation failed');
    }

    const rolesToAdd = newRoleIds.filter(roleId => !existingRoles?.some(r => r.roleId === roleId));
    const rolesToRemove = existingRoles.filter(role => !newRoleIds.includes(role.roleId));

    // Remove roles no longer needed
    await this.databaseService.userRoles.deleteMany({
      where: { userId, roleId: { in: rolesToRemove.map(r => r.roleId) } }
    });

    // Add new roles
    for (const roleId of rolesToAdd) {
      await this.databaseService.userRoles.create({
        data: { userId, roleId }
      });
    }
  }

  async softDeleteUser(userId: string) {
    const now = new Date();
    await this.databaseService.user.update({
      where: { id: userId },
      data: { deletedAt: now },
    });
    // Cascade the soft delete to items, messages, user wallets
    await this.databaseService.item.updateMany({
      where: { sellerId: userId },
      data: { deletedAt: now },
    });

    await this.databaseService.message.updateMany({
      where: { fromId: userId },
      data: { deletedAt: now },
    });

    await this.databaseService.userWallet.updateMany({
      where: { userId: userId },
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

  /**
   * This function checks if there is already a wallet with the new address for the user.
   * If there is, it updates the existing wallet; if not, it creates a new wallet for that user.
   */
  async updateUserWallets(userId: string, walletAddress: string): Promise<UserWallet> {
    const existingWallet = await this.databaseService.userWallet.findFirst({
      where: { userId, walletAddress }
    });

    if (!existingWallet) {
      return await this.databaseService.userWallet.create({
        data: { userId, walletAddress }
      });
    } else {
      return await this.databaseService.userWallet.update({
        where: { id: existingWallet.id },
        data: { walletAddress }
      });
    }
  }

  /**
   * solely focus on checking for an existing nonce for a wallet.
   * If the wallet doesn't exist or no nonce is found, it will return an appropriate response or error,
   * indicating that further actions are needed (possibly triggering a user/wallet creation flow).
   */
  async getNonceForWallet(walletAddress: string): Promise<string> {
    try {
      const normalizedAddress = ethers.utils.getAddress(walletAddress);
      // Attempt to find the wallet
      const wallet = await this.databaseService.userWallet.findUnique({
        where: { walletAddress: normalizedAddress },
      });
  
      // Check if wallet and nonce exist
      if (!wallet || !wallet.nonce) {
        throw new Error('Wallet not found or nonce not set. Please ensure the user and wallet are properly initialized.');
      }
      return wallet.nonce;
    } catch (error) {
      throw new Error('Provided wallet address is invalid: ' + walletAddress);
    }
  }

  generateNonce(): string {
    return randomBytes(16).toString('hex');
  }
}
