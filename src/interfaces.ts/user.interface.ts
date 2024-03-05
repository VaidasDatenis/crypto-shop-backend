import { Item } from "./item.interface";
import { Message } from "./message.interface";
import { Transaction } from "./transaction.interface";

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
  createdAt: Date;
  updatedAt: Date;
}
