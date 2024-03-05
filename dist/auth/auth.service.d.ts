import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { UserService } from 'src/user/user.service';
export declare class AuthService {
    private readonly userService;
    private jwtService;
    constructor(userService: UserService, jwtService: JwtService);
    logIn(providedWalletAddress: string): Promise<{
        access_token: string;
    }>;
    singUp(createUserDto: Prisma.UserCreateInput): Promise<{
        access_token: string;
    }>;
}