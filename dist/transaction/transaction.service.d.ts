import { DatabaseService } from 'src/database/database.service';
import { Prisma } from '@prisma/client';
export declare class TransactionService {
    private readonly databaseService;
    constructor(databaseService: DatabaseService);
    create(createTransactionDto: Prisma.TransactionCreateInput): Promise<{
        id: string;
        itemId: string;
        buyerId: string;
        sellerId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<{
        id: string;
        itemId: string;
        buyerId: string;
        sellerId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        itemId: string;
        buyerId: string;
        sellerId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, updateTransactionDto: Prisma.TransactionUpdateInput): Promise<{
        id: string;
        itemId: string;
        buyerId: string;
        sellerId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        itemId: string;
        buyerId: string;
        sellerId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
