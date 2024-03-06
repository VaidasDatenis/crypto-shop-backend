import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { UserService } from 'src/user/user.service';
export declare class AuthService {
    private readonly userService;
    private jwtService;
    constructor(userService: UserService, jwtService: JwtService);
    connect(signInDto: Prisma.UserCreateInput): Promise<{
        access_token: string;
    }>;
}
