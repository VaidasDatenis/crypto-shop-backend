import { Controller, Get, Post, Body, Patch, Param, Delete, Ip } from '@nestjs/common';
import { UserService } from './user.service';
import { MyLoggerService } from 'src/my-logger/my-logger.service';
import { Prisma } from '@prisma/client';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { CreateItemDto } from './dto/item.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  private readonly logger = new MyLoggerService(UserController.name);

  @Post()
  createUser(@Body() createUserDto: Prisma.UserCreateInput) {
    return this.userService.createUser(createUserDto);
  }

  @Throttle({ short: { ttl: 1000, limit: 1 }})
  @Get(':userId')
  findUserById(@Param('userId',) userId: string) {
    return this.userService.findUserById(userId);
  }

  @Patch(':userId')
  updateUser(@Param('userId') userId: string, @Body() updateUserDto: Prisma.UserUpdateInput) {
    return this.userService.updateUser(userId, updateUserDto);
  }

  @Get(':userId/items')
  findAllUserItems(@Param('userId') userId: string) {
    return this.userService.findAllUserItems(userId);
  }

  @Post(':userId/item')
  createItemByUser(@Param('userId') userId: string, @Body() itemDto: CreateItemDto) {
    return this.userService.createItemByUser(itemDto, userId);
  }

  @Delete(':userId')
  removeUser(@Param('userId') userId: string) {
    return this.userService.removeUser(userId);
  }
}
