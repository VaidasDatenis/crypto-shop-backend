import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class UserRolesService {
  constructor(private readonly databaseService: DatabaseService) {}
}
