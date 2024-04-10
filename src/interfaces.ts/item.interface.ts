import { Transaction } from "./transaction.interface";
import { User } from "./user.interface";

export interface Item {
  id: number;
  title: string;
  description: string;
  images?: JSON;
  price: string;
  currency: string;
  sellerId: number;
  seller: User;
  transactions: Transaction[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
