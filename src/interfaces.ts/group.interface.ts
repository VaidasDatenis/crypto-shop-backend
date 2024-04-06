import { Item } from "./item.interface";
import { User } from "./user.interface";

export interface Group {
  id: string;
  name: string
  description: string
  isPublic: boolean;
  imageUrl: string
  items: Item[];
  members: User[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
