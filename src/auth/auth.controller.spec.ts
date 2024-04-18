import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            connect: jest.fn().mockImplementation((signInDto) => Promise.resolve({
              access_token: 'test-access-token',
              userId: 'test-user-id',
              walletAddress: signInDto.walletAddress,
              signature: signInDto.signature,
            })),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should call AuthService connect with the correct DTO', async () => {
    const signInDto: AuthDto = { walletAddress: 'test-wallet-address', signature: 'test-signature' };
    await controller.signIn(signInDto);
    expect(authService.connect).toHaveBeenCalledWith(signInDto);
  });
});
