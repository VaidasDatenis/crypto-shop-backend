import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
export declare class ItemService {
    private readonly databaseService;
    constructor(databaseService: DatabaseService);
    create(createItemDto: Prisma.ItemCreateInput): Promise<{
        id: string;
        title: string;
        description: string;
        images: Prisma.JsonValue;
        price: Prisma.Decimal;
        currency: string;
        sellerId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<{
        id: string;
        title: string;
        description: string;
        images: Prisma.JsonValue;
        price: Prisma.Decimal;
        currency: string;
        sellerId: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        title: string;
        description: string;
        images: Prisma.JsonValue;
        price: Prisma.Decimal;
        currency: string;
        sellerId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, updateItemDto: Prisma.ItemUpdateInput): Promise<{
        id: string;
        title: string;
        description: string;
        images: Prisma.JsonValue;
        price: Prisma.Decimal;
        currency: string;
        sellerId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        title: string;
        description: string;
        images: Prisma.JsonValue;
        price: Prisma.Decimal;
        currency: string;
        sellerId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
