import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { DatabaseModule } from 'src/database/database.module';
import { RolesService } from 'src/roles/roles.service';

@Module({
  imports: [DatabaseModule],
  controllers: [UserController],
  providers: [UserService, RolesService],
  exports: [UserService],
})
export class UserModule {}
