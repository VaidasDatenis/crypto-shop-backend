import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class ItemService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createItemDto: Prisma.ItemCreateInput) {
    return this.databaseService.item.create({
      data: createItemDto
    })
  }

  async findAll() {
    return this.databaseService.item.findMany();
  }

  async findOne(id: string) {
    return this.databaseService.item.findUnique({
      where: {
        id,
      }
    })
  }

  async update(id: string, updateItemDto: Prisma.ItemUpdateInput) {
    const sellerData = updateItemDto?.seller;

    return this.databaseService.item.update({
      where: {
        id,
      },
      data: updateItemDto
    })
  }

  async remove(id: string) {
    return this.databaseService.item.delete({
      where: {
        id,
      }
    })
  }
}
