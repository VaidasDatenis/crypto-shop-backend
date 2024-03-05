import { DatabaseService } from 'src/database/database.service';
import { Prisma } from '@prisma/client';
export declare class MessageService {
    private readonly databaseService;
    constructor(databaseService: DatabaseService);
    create(createMessageDto: Prisma.MessageCreateInput): Promise<{
        id: string;
        content: string;
        fromId: string;
        toId: string;
        createdAt: Date;
    }>;
    findAll(): Promise<{
        id: string;
        content: string;
        fromId: string;
        toId: string;
        createdAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        content: string;
        fromId: string;
        toId: string;
        createdAt: Date;
    }>;
    update(id: string, updateMessageDto: Prisma.MessageUpdateInput): Promise<{
        id: string;
        content: string;
        fromId: string;
        toId: string;
        createdAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        content: string;
        fromId: string;
        toId: string;
        createdAt: Date;
    }>;
}
