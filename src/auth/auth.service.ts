import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { AuthDto } from './dto/auth.dto';
import { ethers } from 'ethers';
import { JwtResponseDto } from './dto/jwt.dto';
import { MyLoggerService } from 'src/my-logger/my-logger.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
    private logger: MyLoggerService,
  ) {}

  async connect(signInDto: AuthDto): Promise<JwtResponseDto> {
    try {
      let user = await this.usersService.findUserByWalletAddress(signInDto.walletAddress);
      let nonce = user ? await this.usersService.getNonceForWallet(signInDto.walletAddress) : null;

      if (!user || !nonce) {
        user = await this.usersService.findOrCreateUser({ walletAddress: signInDto.walletAddress });
        nonce = await this.usersService.getNonceForWallet(signInDto.walletAddress);
      }

      const message = `Sign this message to login. Nonce: ${nonce}`;
      if (!this.verifySignature(message, signInDto.signature, signInDto.walletAddress)) {
        throw new UnauthorizedException('Signature verification failed');
      }

      const payload = { id: user.id, walletAddress: ethers.utils.getAddress(signInDto.walletAddress) };
      return {
        access_token: await this.jwtService.signAsync(payload),
        userId: user.id,
      };
    } catch (error) {
      this.logger.error('Error during connect', `${error.message}\nStack: ${error.stack}`);
      throw new UnauthorizedException('Authentication failed.');
    }
  }

  verifySignature(message: string, signature: string, expectedAddress: string): boolean {
    const messageHash = ethers.utils.solidityKeccak256(['string'], [message]);
    const messageBytes = ethers.utils.arrayify(messageHash);
    const recoveredAddress = ethers.utils.recoverAddress(messageBytes, signature);
    return recoveredAddress === ethers.utils.getAddress(expectedAddress);
  }
}
