import { Injectable } from '@nestjs/common';
import { ModuleType } from '@prisma/client';
import { PrismaService } from 'src/globals/services/prisma.service';

@Injectable()
export class ModuleProvider {
  constructor(private readonly prisma: PrismaService) {}

  async syncModules() {
    await this.prisma.$transaction(async (prisma) => {
      for (const module of MODULES) {
        // const nameEn = module.nameEn;
        // const nameAr = module.nameAr;
        // await prisma.module.upsert({
        //   // where: { nameEn },
        //   update: {
        //     nameEn: nameEn,
        //     nameAr: nameAr,
        //     descriptionAr: '11',
        //     descriptionEn: '11',
        //     type: module.type,
        //     thumbnail: module.thumbnail,
        //     icon: module.icon,
        //   },
        //   create: {
        //     nameEn: nameEn,
        //     nameAr: nameAr,
        //     descriptionAr: '11',
        //     descriptionEn: '11',
        //     type: module.type,
        //     thumbnail: module.thumbnail,
        //     icon: module.icon,
        //     isActive: true,
        //   },
        // });
      }
    });
  }
  //
}

const MODULES = [
  {
    nameEn: 'Grocery',
    nameAr: 'بقالة',
    type: ModuleType.GROCERY,
    thumbnail:
      'uploads/modules/image/Edit/thumbnail-dfb1533c-a060-4849-8693-17088d9498a8.png',

    icon: 'uploads/modules/image/Edit/thumbnail-dfb1533c-a060-4849-8693-17088d9498a8.png',
  },
  {
    nameEn: 'Pharmacy',
    nameAr: 'صيدلية',
    type: ModuleType.PHARMACY,
    thumbnail:
      'uploads/modules/image/Edit/thumbnail-dfb1533c-a060-4849-8693-17088d9498a8.png',

    icon: 'uploads/modules/image/Edit/thumbnail-dfb1533c-a060-4849-8693-17088d9498a8.png',
  },
  {
    nameEn: 'Shop',
    nameAr: 'متجر',
    type: ModuleType.ECOMMERCE,
    thumbnail:
      'uploads/modules/image/Edit/thumbnail-dfb1533c-a060-4849-8693-17088d9498a8.png',

    icon: 'uploads/modules/image/Edit/thumbnail-dfb1533c-a060-4849-8693-17088d9498a8.png',
  },
  {
    nameEn: 'Food',
    nameAr: 'مطاعم',
    type: ModuleType.FOOD,
    thumbnail:
      'uploads/modules/image/Edit/thumbnail-dfb1533c-a060-4849-8693-17088d9498a8.png',

    icon: 'uploads/modules/image/Edit/thumbnail-dfb1533c-a060-4849-8693-17088d9498a8.png',
  },
  {
    nameEn: 'Parcel',
    nameAr: 'مرسول',
    type: ModuleType.PARCEL,
    thumbnail:
      'uploads/modules/image/Edit/thumbnail-dfb1533c-a060-4849-8693-17088d9498a8.png',

    icon: 'uploads/modules/image/Edit/thumbnail-dfb1533c-a060-4849-8693-17088d9498a8.png',
  },
  {
    nameEn: 'Services',
    nameAr: 'خدمات',
    type: ModuleType.SERVICES,
    thumbnail:
      'uploads/modules/image/Edit/thumbnail-dfb1533c-a060-4849-8693-17088d9498a8.png',

    icon: 'uploads/modules/image/Edit/thumbnail-dfb1533c-a060-4849-8693-17088d9498a8.png',
  },
];
