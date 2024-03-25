import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { MyLoggerService } from 'src/my-logger/my-logger.service';
import { Throttle } from '@nestjs/throttler';
import { CreateItemDto } from './dto/item.dto';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { RolesService } from 'src/roles/roles.service';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRoles } from 'src/enums/roles.enum';
import { RolesGuard } from 'src/guards/roles.guard';
import { GetUser } from 'src/decorators/get-user.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { AuthRequest } from 'src/interfaces.ts/auth-request.interface';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly rolesService: RolesService,
  ) {}
  private readonly logger = new MyLoggerService(UserController.name);

  @Throttle({ short: { ttl: 1000, limit: 1 }})
  @Post()
  @UseGuards(AuthGuard)
  createUser(@Body() createUserDto: CreateUserDto, @Req() req: AuthRequest) {
    const requestorId = req.user?.userId;
    return this.userService.createUser(createUserDto, requestorId);
  }

  @Throttle({ short: { ttl: 1000, limit: 1 }})
  @Get(':userId')
  findUserById(@Param('userId',) userId: string) {
    return this.userService.findUserById(userId);
  }

  @Patch(':userId')
  @UseGuards(AuthGuard, RolesGuard)
  updateUser(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
    @GetUser('id') requestorId: string,
  ) {
    return this.userService.updateUser(userId, updateUserDto, requestorId);
  }

  @Get(':userId/items')
  findAllUserItems(@Param('userId') userId: string) {
    return this.userService.findAllUserItems(userId);
  }

  @Post(':userId/item')
  createItemByUser(@Param('userId') userId: string, @Body() itemDto: CreateItemDto) {
    return this.userService.createItemByUser(itemDto, userId);
  }

  @Get(':userId/roles')
  @Roles(UserRoles.ADMIN)
  getRolesByUserId(@Param('userId') userId: string) {
    return this.rolesService.getRolesByUserId(userId);
  }

  @Delete(':userId')
  removeUser(@Param('userId') userId: string) {
    return this.userService.removeUser(userId);
  }
}
