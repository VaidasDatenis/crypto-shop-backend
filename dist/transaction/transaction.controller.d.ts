import { TransactionService } from './transaction.service';
import { Prisma } from '@prisma/client';
export declare class TransactionController {
    private readonly transactionService;
    constructor(transactionService: TransactionService);
    private readonly logger;
    create(createTransactionDto: Prisma.TransactionCreateInput): Promise<{
        id: string;
        itemId: string;
        buyerId: string;
        sellerId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(ip: string): Promise<{
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
