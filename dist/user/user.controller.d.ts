import { UserService } from './user.service';
import { Prisma } from '@prisma/client';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    private readonly logger;
    create(createUserDto: Prisma.UserCreateInput): Promise<{
        id: string;
        walletAddress: string;
        walletNames: Prisma.JsonValue;
        email: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(ip: string): Promise<{
        id: string;
        walletAddress: string;
        walletNames: Prisma.JsonValue;
        email: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        walletAddress: string;
        walletNames: Prisma.JsonValue;
        email: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, updateUserDto: Prisma.UserUpdateInput): Promise<{
        id: string;
        walletAddress: string;
        walletNames: Prisma.JsonValue;
        email: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        walletAddress: string;
        walletNames: Prisma.JsonValue;
        email: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
