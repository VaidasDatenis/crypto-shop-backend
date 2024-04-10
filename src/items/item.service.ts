import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateItemDto, UpdateItemDto } from './dto/item.dto';
import { RolesService } from 'src/roles/roles.service';
import { GroupsService } from 'src/groups/groups.service';

@Injectable()
export class ItemService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly rolesService: RolesService,
    private readonly groupsService: GroupsService,
  ) {}

  async findAll() {
    return this.databaseService.item.findMany();
  }

  async findOne(id: string) {
    const item = await this.databaseService.item.findUnique({
      where: { id },
    });
    if (!item) {
      throw new NotFoundException(`Item with ID "${id}" not found.`);
    }
    return item;
  }

  async findAllUserItems(userId: string) {
    return this.databaseService.user.findUnique({
      where: { id: userId },
      include: { items: true },
    });
  }

  async createItemByUser(createItemDto: CreateItemDto, userId: string) {
    return this.databaseService.item.create({
      data: {
        ...createItemDto,
        sellerId: userId,
      }
    })
  }

  async updateItem(userId: string, itemId: string, updateItemDto: UpdateItemDto) {
    const item = await this.databaseService.item.findUnique({
      where: { id: itemId, deletedAt: null },
    });

    if (!item) throw new NotFoundException(`Item with ID "${itemId}" not found.`);
    const isAdmin = await this.rolesService.isUserAdmin(userId);
    if (item.sellerId !== userId && !isAdmin) {
      throw new UnauthorizedException('You are not authorized to update this item.');
    }

    return await this.databaseService.item.update({
      where: { id: itemId },
      data: updateItemDto,
    });
  }

  async softDeleteItem(userId: string, itemId: string): Promise<void> {
    const item = await this.databaseService.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new NotFoundException(`Item with ID "${itemId}" not found.`);
    }

    const isAdmin = await this.rolesService.isUserAdmin(userId);
    if (item.sellerId !== userId && !isAdmin) {
      throw new UnauthorizedException('You are not authorized to delete this item.');
    }

    await this.databaseService.$transaction(async () => {
      await this.databaseService.item.update({
        where: { id: itemId },
        data: { deletedAt: new Date() },
      });

      if (item.groupId) {
        await this.groupsService.softDeleteItemFromGroup(itemId, item.groupId);
      }
    });
  }
}
