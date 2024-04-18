import { Controller, Get, Param, Ip, Post, Patch, Body, UseGuards, Delete } from '@nestjs/common';
import { ItemService } from './item.service';
import { MyLoggerService } from 'src/my-logger/my-logger.service';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { Public } from 'src/auth/constants';
import { ExcludeSoftDeleted } from 'src/decorators/exclude-soft-deleted.decorator';
import { CreateItemDto, UpdateItemDto } from './dto/item.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { GetUser } from 'src/decorators/get-user.decorator';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRoles } from 'src/enums/roles.enum';

@Controller('items')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}
  private readonly logger = new MyLoggerService(ItemController.name);

  @Public()
  @SkipThrottle({ default: false })
  @Get()
  @ExcludeSoftDeleted(true)
  findAll(@Ip() ip: string) {
    this.logger.log(`Req User findAll()\t${ip}`, ItemController.name);
    return this.itemService.findAll();
  }

  @Public()
  @Throttle({ short: { ttl: 1, limit: 1 }})
  @Get(':id')
  @Roles(UserRoles.ADMIN, UserRoles.USER)
  @UseGuards(AuthGuard, RolesGuard)
  @ExcludeSoftDeleted(true)
  findOne(@Param('id') id: string) {
    return this.itemService.findOne(id);
  }

  @Get(':userId/items')
  @ExcludeSoftDeleted(true)
  @Roles(UserRoles.ADMIN, UserRoles.USER)
  @UseGuards(AuthGuard, RolesGuard)
  @ExcludeSoftDeleted(true)
  findAllUserItems(@Param('userId') userId: string) {
    return this.itemService.findAllUserItems(userId);
  }

  @Post(':userId/item')
  @Roles(UserRoles.ADMIN, UserRoles.USER)
  @UseGuards(AuthGuard, RolesGuard)
  createItemByUser(@Param('userId') userId: string, @Body() itemDto: CreateItemDto) {
    return this.itemService.createItemByUser(itemDto, userId);
  }

  @Patch(':itemId')
  @Roles(UserRoles.ADMIN, UserRoles.USER)
  @UseGuards(AuthGuard, RolesGuard)
  async updateItem(
    @GetUser('id') userId: string,
    @Param('itemId') itemId: string,
    @Body() updateItemDto: UpdateItemDto
  ) {
    return await this.itemService.updateItem(userId, itemId, updateItemDto);
  }

  @Delete(':itemId')
  @Roles(UserRoles.ADMIN, UserRoles.USER)
  @UseGuards(AuthGuard, RolesGuard)
  softDeleteItem(
    @Param('itemId') itemId: string,
    @GetUser('id') userId: string,
  ) {
    return this.itemService.softDeleteItem(userId, itemId);
  }
}
