import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { Public } from './constants';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Throttle({ long : { ttl: 60, limit: 10 }})
  @Post('connect')
  signIn(@Body() signInDto: AuthDto) {
    return this.authService.connect(signInDto);
  }
}
