import { Module } from '@nestjs/common';
import { UserRolesService } from './user-roles.service';
import { UserRolesController } from './user-roles.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [UserRolesController],
  providers: [UserRolesService],
  exports: [UserRolesService]
})
export class UserRolesModule {}
