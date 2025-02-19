import { ModuleType } from '@prisma/client';

declare global {
  type Module = {
    id: string;
    type: ModuleType;
    thumbnail: string;
    status: boolean;
    icon: string;
    name: string;
    description: string;
  };
}
export {};
