import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class ItemService {
  constructor(private readonly databaseService: DatabaseService) {}

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
}
