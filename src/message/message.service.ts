import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class MessageService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createMessageDto: Prisma.MessageCreateInput) {
    return this.databaseService.message.create({
      data: createMessageDto
    })
  }

  async findAll() {
    return this.databaseService.message.findMany();
  }

  async findOne(id: string) {
    return this.databaseService.message.findUnique({
      where: {
        id,
      }
    })
  }

  async update(id: string, updateMessageDto: Prisma.MessageUpdateInput) {
    return this.databaseService.message.update({
      where: {
        id,
      },
      data: updateMessageDto
    })
  }

  async remove(id: string) {
    return this.databaseService.message.delete({
      where: {
        id,
      }
    })
  }
}
