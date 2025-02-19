import { Roles } from '@prisma/client';

declare global {
  interface Role {
    id: Id;
    role: string;
    baseRole: Roles;
  }
}
