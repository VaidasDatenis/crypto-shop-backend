import { UserRoles } from "src/enums/roles.enum";
import { Item } from "./item.interface";
import { Message } from "./message.interface";
import { Transaction } from "./transaction.interface";
import { Group } from "./group.interface";
export interface User {
    id: number;
    walletAddress: string;
    walletNames: JSON;
    email?: string;
    items: Item[];
    buyerTransactions: Transaction[];
    sellerTransactions: Transaction[];
    messagesSent: Message[];
    messagesReceived: Message[];
    ownedGroups?: Group[];
    memberships?: Group[];
    roles: UserRoles[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
