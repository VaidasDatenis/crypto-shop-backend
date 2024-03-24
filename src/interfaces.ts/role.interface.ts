import { ROLES } from "src/enums/roles.enum";

export interface Role {
  id: string;
  name: ROLES;
  description?: string;
}


