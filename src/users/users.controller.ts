import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { Throttle } from '@nestjs/throttler';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRoles } from 'src/enums/roles.enum';
import { RolesGuard } from 'src/guards/roles.guard';
import { GetUser } from 'src/decorators/get-user.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { AuthRequest } from 'src/interfaces.ts/auth-request.interface';
import { ExcludeSoftDeleted } from 'src/decorators/exclude-soft-deleted.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  @Throttle({ short: { ttl: 1, limit: 1 }})
  @Post()
  @Roles(UserRoles.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  findOrCreateUser(@Body() createUserDto: CreateUserDto, @Req() req: AuthRequest) {
    const requestorId = req.user?.userId;
    return this.usersService.findOrCreateUser(createUserDto, requestorId);
  }

  @Throttle({ short: { ttl: 1, limit: 1 }})
  @Get(':userId')
  @Roles(UserRoles.ADMIN, UserRoles.USER)
  @UseGuards(AuthGuard, RolesGuard)
  @ExcludeSoftDeleted(true)
  findUserById(@Param('userId',) userId: string) {
    return this.usersService.findUserById(userId);
  }

  @Patch(':userId')
  @Roles(UserRoles.ADMIN, UserRoles.USER)
  @UseGuards(AuthGuard, RolesGuard)
  updateUser(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
    @GetUser('id') requestorId: string,
  ) {
    return this.usersService.updateUser(userId, updateUserDto, requestorId);
  }

  @Delete(':userId')
  @Roles(UserRoles.ADMIN, UserRoles.USER)
  @UseGuards(AuthGuard, RolesGuard)
  removeUser(@Param('userId') userId: string) {
    return this.usersService.softDeleteUserAndCleanup(userId);
  }
}
