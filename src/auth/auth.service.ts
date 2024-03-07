import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { UserService } from 'src/users/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
    ) {}

  async connect(signInDto: Prisma.UserCreateInput): Promise<{ access_token: string }> {
    let user = await this.userService.findUserByWalletAddress(signInDto.walletAddress);
    // If user doesn't exist, create a new user record
    if (!user) {
      user = await this.userService.createUser(signInDto);
    }
    const { walletAddress, ...result } = user;
    const payload = { sub: user.id, walletAddress: user.walletAddress };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
