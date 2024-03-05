import { Controller, Get, Post, Body, Patch, Param, Delete, Ip, ParseIntPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { MyLoggerService } from 'src/my-logger/my-logger.service';
import { Prisma } from '@prisma/client';
import { SkipThrottle, Throttle } from '@nestjs/throttler';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  private readonly logger = new MyLoggerService(UserController.name);

  @Post()
  create(@Body() createUserDto: Prisma.UserCreateInput) {
    return this.userService.create(createUserDto);
  }

  @SkipThrottle({ default: false })
  @Get()
  findAll(@Ip() ip: string) {
    this.logger.log(`Req User findAll()\t${ip}`, UserController.name);
    return this.userService.findAll();
  }

  @Throttle({ short: { ttl: 1000, limit: 1 }})
  @Get(':id')
  findOne(@Param('id',) id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: Prisma.UserUpdateInput) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
