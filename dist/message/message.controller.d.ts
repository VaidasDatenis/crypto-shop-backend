import { MessageService } from './message.service';
import { Prisma } from '@prisma/client';
export declare class MessageController {
    private readonly messageService;
    constructor(messageService: MessageService);
    private readonly logger;
    create(createMessageDto: Prisma.MessageCreateInput): Promise<{
        id: string;
        content: string;
        fromId: string;
        toId: string;
        createdAt: Date;
    }>;
    findAll(ip: string): Promise<{
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
