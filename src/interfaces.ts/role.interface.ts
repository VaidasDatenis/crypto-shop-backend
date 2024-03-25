import { UserRoles } from "src/enums/roles.enum";

export interface Role {
  id: string;
  name: UserRoles[];
  description?: string;
}
