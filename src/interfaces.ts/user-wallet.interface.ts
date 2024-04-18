import { User } from "./user.interface";

export interface UserWallet {
  id: string;
  walletAddress: string;
  user: User;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}