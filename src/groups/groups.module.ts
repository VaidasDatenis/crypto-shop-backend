import { Module } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { DatabaseModule } from 'src/database/database.module';
import { RolesService } from 'src/roles/roles.service';

@Module({
  imports: [DatabaseModule],
  controllers: [GroupsController],
  providers: [GroupsService, RolesService],
  exports: [GroupsService],
})
export class GroupsModule {}
