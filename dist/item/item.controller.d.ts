import { ItemService } from './item.service';
import { Prisma } from '@prisma/client';
export declare class ItemController {
    private readonly itemService;
    constructor(itemService: ItemService);
    private readonly logger;
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
    findAll(ip: string): Promise<{
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
