import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/users/user.service';
import { AuthDto } from './dto/auth.dto';
export declare class AuthService {
    private readonly userService;
    private jwtService;
    constructor(userService: UserService, jwtService: JwtService);
    connect(signInDto: AuthDto): Promise<{
        access_token: string;
        userId: string;
    }>;
}
