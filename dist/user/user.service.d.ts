import { DatabaseService } from 'src/database/database.service';
import { Prisma } from '@prisma/client';
export declare class UserService {
    private readonly databaseService;
    constructor(databaseService: DatabaseService);
    create(createUserDto: Prisma.UserCreateInput): Promise<{
        id: string;
        walletAddress: string;
        walletNames: Prisma.JsonValue;
        email: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<{
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
    findUserByWalletAddress(walletAddress: string): Promise<{
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
