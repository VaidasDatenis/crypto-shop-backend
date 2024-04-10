import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { DatabaseModule } from 'src/database/database.module';
import { GroupsModule } from 'src/groups/groups.module';
import { RolesModule } from 'src/roles/roles.module';

@Module({
  imports: [GroupsModule, RolesModule, DatabaseModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
