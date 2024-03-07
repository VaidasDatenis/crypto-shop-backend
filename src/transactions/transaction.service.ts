import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TransactionService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createTransactionDto: Prisma.TransactionCreateInput) {
    return this.databaseService.transaction.create({
      data: createTransactionDto
    })
  }

  async findAll() {
    return this.databaseService.transaction.findMany();
  }

  async findOne(id: string) {
    return this.databaseService.transaction.findUnique({
      where: {
        id,
      }
    })
  }

  async update(id: string, updateTransactionDto: Prisma.TransactionUpdateInput) {
    return this.databaseService.transaction.update({
      where: {
        id,
      },
      data: updateTransactionDto
    })
  }

  async remove(id: string) {
    return this.databaseService.transaction.delete({
      where: {
        id,
      }
    })
  }
}
