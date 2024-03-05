import { Controller, Get, Post, Body, Patch, Param, Delete, Ip } from '@nestjs/common';
import { ItemService } from './item.service';
import { MyLoggerService } from 'src/my-logger/my-logger.service';
import { Prisma } from '@prisma/client';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { Public } from 'src/auth/constants';

@Controller('item')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}
  private readonly logger = new MyLoggerService(ItemController.name);

  @Post()
  create(@Body() createItemDto: Prisma.ItemCreateInput) {
    return this.itemService.create(createItemDto);
  }

  @Public()
  @SkipThrottle({ default: false })
  @Get()
  findAll(@Ip() ip: string) {
    this.logger.log(`Req User findAll()\t${ip}`, ItemController.name);
    return this.itemService.findAll();
  }

  @Throttle({ short: { ttl: 1000, limit: 1 }})
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.itemService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateItemDto: Prisma.ItemUpdateInput) {
    return this.itemService.update(id, updateItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.itemService.remove(id);
  }
}
