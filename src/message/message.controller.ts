import { Controller, Get, Post, Body, Patch, Param, Delete, Ip } from '@nestjs/common';
import { MessageService } from './message.service';
import { MyLoggerService } from 'src/my-logger/my-logger.service';
import { Prisma } from '@prisma/client';
import { SkipThrottle, Throttle } from '@nestjs/throttler';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}
  private readonly logger = new MyLoggerService(MessageController.name);

  @Post()
  create(@Body() createMessageDto: Prisma.MessageCreateInput) {
    return this.messageService.create(createMessageDto);
  }

  @SkipThrottle({ default: false })
  @Get()
  findAll(@Ip() ip: string) {
    this.logger.log(`Req User findAll()\t${ip}`, MessageController.name);
    return this.messageService.findAll();
  }

  @Throttle({ short: { ttl: 1000, limit: 1 }})
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.messageService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMessageDto: Prisma.MessageUpdateInput) {
    return this.messageService.update(id, updateMessageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.messageService.remove(id);
  }
}
