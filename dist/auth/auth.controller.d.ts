import { AuthService } from './auth.service';
import { Prisma } from '@prisma/client';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    signIn(signInDto: Prisma.UserCreateInput): Promise<{
        access_token: string;
    }>;
    signUp(createUserDto: Prisma.UserCreateInput): Promise<{
        access_token: string;
    }>;
}
