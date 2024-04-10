import { Module } from '@nestjs/common';
import { ItemService } from './item.service';
import { ItemController } from './item.controller';
import { DatabaseModule } from 'src/database/database.module';
import { RolesModule } from 'src/roles/roles.module';
import { GroupsModule } from 'src/groups/groups.module';

@Module({
  imports: [GroupsModule, RolesModule, DatabaseModule],
  controllers: [ItemController],
  providers: [ItemService],
  exports: [ItemService],
})
export class ItemModule {}
