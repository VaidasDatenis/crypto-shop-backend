import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserController } from './users.controller';
import { DatabaseModule } from 'src/database/database.module';
import { GroupsModule } from 'src/groups/groups.module';
import { RolesModule } from 'src/roles/roles.module';

@Module({
  imports: [GroupsModule, RolesModule, DatabaseModule],
  controllers: [UserController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UserModule {}
