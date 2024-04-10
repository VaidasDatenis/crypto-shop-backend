import { User } from "./user.interface";
export interface Message {
    id: number;
    content: string;
    fromId: number;
    toId: number;
    from: User;
    to: User;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
