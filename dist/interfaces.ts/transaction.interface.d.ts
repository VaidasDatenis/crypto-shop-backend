import { Item } from "./item.interface";
import { User } from "./user.interface";
export interface Transaction {
    id: number;
    itemId: number;
    buyerId: number;
    sellerId: number;
    item: Item;
    buyer: User;
    seller: User;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
