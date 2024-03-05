import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
    ) {}

  async logIn(providedWalletAddress: string): Promise<{ access_token: string }> {
    const user = await this.userService.findUserByWalletAddress(providedWalletAddress);
    if (user?.walletAddress !== providedWalletAddress) {
      throw new UnauthorizedException();
    }
    const { walletAddress, ...result } = user;
    const payload = { sub: user.id, walletAddress: user.walletAddress };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async singUp(createUserDto: Prisma.UserCreateInput) {
    const newUser = await this.userService.create(createUserDto);
    const { walletAddress, ...result } = newUser;
    const payload = { sub: newUser.id, walletAddress: newUser.walletAddress };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
