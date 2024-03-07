import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { Prisma } from '@prisma/client';
import { CreateItemDto } from './dto/item.dto';

@Injectable()
export class UserService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createUser(createUserDto: Prisma.UserCreateInput) {
    return this.databaseService.user.create({
      data: createUserDto
    })
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

  async updateUser(userId: string, updateUserDto: Prisma.UserUpdateInput) {
    return this.databaseService.user.update({
      where: {
        id: userId,
      },
      data: updateUserDto
    })
  }

  async removeUser(userId: string) {
    return this.databaseService.user.delete({
      where: {
        id: userId,
      }
    })
  }
}
