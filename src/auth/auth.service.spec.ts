import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { AuthDto } from './dto/auth.dto';
import { UserService } from 'src/users/user.service';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  const mockFindUserByWalletAddress = jest.fn();

  beforeEach(async () => {
    mockFindUserByWalletAddress.mockReset().mockResolvedValue(null);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findUserByWalletAddress: mockFindUserByWalletAddress,
            createUser: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('mocked-jwt-token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should return access token and userId for existing user', async () => {
    const authDto: AuthDto = { walletAddress: 'test-wallet-address' };
    mockFindUserByWalletAddress.mockResolvedValue({
      id: 'test-user-id',
      walletAddress: 'test-wallet-address',
    });

    const result = await service.connect(authDto);

    expect(result).toEqual({
      access_token: expect.any(String),
      userId: 'test-user-id',
    });
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: 'test-user-id',
      walletAddress: 'test-wallet-address',
    });
  });
});
