import { ModuleType } from '@prisma/client';

declare global {
  type ModuleDto = {
    type: ModuleType;
    nameAr: string;
    nameEn: string;
    icon: string;
    thumbnail: string;

    descriptionAr: string;
    descriptionEn: string;
  };
}
export {};
