import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { MyLoggerService } from 'src/my-logger/my-logger.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let loggerService: jest.Mocked<MyLoggerService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findUserByWalletAddress: jest.fn(),
            getNonceForWallet: jest.fn(),
            findOrCreateUser: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        {
          provide: MyLoggerService,
          useValue: {
            error: jest.fn(),
          }
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<jest.Mocked<UsersService>>(UsersService);
    jwtService = module.get<jest.Mocked<JwtService>>(JwtService);
    jwtService.signAsync.mockResolvedValue('mocked-jwt-token'); // Mock response for JWT signing
    loggerService = module.get<jest.Mocked<MyLoggerService>>(MyLoggerService);
  });

  describe('connect', () => {
    it('should authenticate and return JWT token if signature verification succeeds', async () => {
      const walletAddress = '0x8F4360939aAE0fcf389C81A1760572389d6907e7';
      const nonce = '12345';
      const signature = '0xe67925ee64ee433ad3a9bba3e39d4950565eae2a7389b1ef9af1e196f75c79014cf522bc46b43d0298fd24d52e5b6795ad683525ee9a4708ae11d6fff261af571b';
      const signInDto = { walletAddress, signature };
      const user = { id: 'user1', walletAddress, email: 'test@example.com', createdAt: new Date(), updatedAt: new Date(), deletedAt: null };

      usersService.findUserByWalletAddress.mockResolvedValue(user);
      usersService.getNonceForWallet.mockResolvedValue(nonce);
      service.verifySignature = jest.fn().mockReturnValue(true); // Mock verifySignature as always valid

      const result = await service.connect(signInDto);

      expect(service.verifySignature).toHaveBeenCalledWith(`Sign this message to login. Nonce: ${nonce}`, signature, walletAddress);
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        id: user.id,
        walletAddress: user.walletAddress,
      });
      expect(result).toEqual({
        access_token: 'mocked-jwt-token',
        userId: user.id,
      });
    });

    it('should throw UnauthorizedException if signature verification fails', async () => {
      const walletAddress = '0x8F4360939aAE0fcf389C81A1760572389d6907e7';
      const nonce = '12345';
      const signature = '0x...';
      const signInDto = { walletAddress, signature };
      const user = { id: 'user1', walletAddress, email: 'test@example.com', createdAt: new Date(), updatedAt: new Date(), deletedAt: null };

      usersService.findUserByWalletAddress.mockResolvedValue(user);
      usersService.getNonceForWallet.mockResolvedValue(nonce);
      service.verifySignature = jest.fn().mockReturnValue(false);

      await expect(service.connect(signInDto)).rejects.toThrow(UnauthorizedException);
      expect(service.verifySignature).toHaveBeenCalledWith(`Sign this message to login. Nonce: ${nonce}`, signature, walletAddress);
  });
  });
});
