import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/users/user.service';
import { AuthDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
    ) {}

  async connect(signInDto: AuthDto): Promise<{ access_token: string; userId: string }> {
    let user = await this.userService.findUserByWalletAddress(signInDto.walletAddress);
    // If user doesn't exist, create a new user record
    if (!user) {
      user = await this.userService.createUser(signInDto);
    }
    const { walletAddress, ...result } = user;
    const payload = { sub: user.id, walletAddress: user.walletAddress };
    return {
      access_token: await this.jwtService.signAsync(payload),
      userId: user.id
    };
  }
}
