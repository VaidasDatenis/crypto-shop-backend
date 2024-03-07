import { Controller, Get, Param, Ip } from '@nestjs/common';
import { ItemService } from './item.service';
import { MyLoggerService } from 'src/my-logger/my-logger.service';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { Public } from 'src/auth/constants';

@Controller('items')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}
  private readonly logger = new MyLoggerService(ItemController.name);

  @Public()
  @SkipThrottle({ default: false })
  @Get()
  findAll(@Ip() ip: string) {
    this.logger.log(`Req User findAll()\t${ip}`, ItemController.name);
    return this.itemService.findAll();
  }

  @Public()
  @Throttle({ short: { ttl: 1000, limit: 1 }})
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.itemService.findOne(id);
  }
}
