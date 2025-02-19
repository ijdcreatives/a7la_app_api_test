import { Injectable } from '@nestjs/common';
import { PermissionsType } from '@prisma/client';
import { PrismaService } from 'src/globals/services/prisma.service';
import { Permissions } from './permissions';

@Injectable()
export class PermissionsProvider {
  constructor(private readonly prisma: PrismaService) {}

  async syncPermissions() {
    await this.prisma.$transaction(async (prisma) => {
      for (const permission of Permissions) {
        const nameEn = Object.values(permission)[0];
        const nameAr = Object.values(permission)[1];
        const type = Object.values(permission)[2] as PermissionsType;
        await prisma.permissions.upsert({
          where: { nameEn },
          update: {
            nameEn: nameEn,
            nameAr: nameAr,
            type: type,
          },
          create: {
            nameEn: nameEn,
            nameAr: nameAr,
            type: type,
          },
        });

        await this.createRolePermission(type, nameEn, prisma as PrismaService);
      }
    });
  }
  //

  async superAdminInitiation() {
    await this.prisma.$transaction(async (prisma) => {
      await prisma.role.upsert({
        where: { id: 1 },
        update: { nameEn: 'Admin', nameAr: 'Admin' },
        create: { nameEn: 'Admin', nameAr: 'Admin' },
      });

      await prisma.role.upsert({
        where: { id: 2 },
        update: { nameEn: 'Customer', nameAr: 'Customer' },
        create: { nameEn: 'Customer', nameAr: 'Customer' },
      });
      await prisma.role.upsert({
        where: { id: 3 },
        update: { nameEn: 'Vendor', nameAr: 'Vendor' },
        create: { nameEn: 'Vendor', nameAr: 'Vendor' },
      });

      await prisma.role.upsert({
        where: { id: 4 },
        update: { nameEn: 'Delivery', nameAr: 'Delivery' },
        create: { nameEn: 'Delivery', nameAr: 'Delivery' },
      });

      await prisma.role.upsert({
        where: { id: 5 },
        update: { nameEn: 'Manager', nameAr: 'Manager' },
        create: { nameEn: 'Manager', nameAr: 'Manager' },
      });

      await prisma.role.upsert({
        where: { id: 5 },
        update: { nameEn: 'Specialist', nameAr: 'Specialist' },
        create: { nameEn: 'Specialist', nameAr: 'Specialist' },
      });
    });
  }

  private async createRolePermission(
    type: PermissionsType,
    nameEn: string,
    prisma: Omit<
      PrismaService,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >,
  ) {
    if (type === PermissionsType.GLOBAL) {
      await prisma.rolePermission.upsert({
        where: {
          role_permission: {
            role: 1,
            permission: nameEn,
          },
        },
        update: { role: 1, permission: nameEn },
        create: { role: 1, permission: nameEn },
      });

      await prisma.rolePermission.upsert({
        where: {
          role_permission: {
            role: 3,
            permission: nameEn,
          },
        },
        update: { role: 3, permission: nameEn },
        create: { role: 3, permission: nameEn },
      });

      await prisma.rolePermission.upsert({
        where: {
          role_permission: {
            role: 5,
            permission: nameEn,
          },
        },
        update: { role: 5, permission: nameEn },
        create: { role: 5, permission: nameEn },
      });
    } else if (type === PermissionsType.STORE) {
      await prisma.rolePermission.upsert({
        where: {
          role_permission: {
            role: 3,
            permission: nameEn,
          },
        },
        update: { role: 3, permission: nameEn },
        create: { role: 3, permission: nameEn },
      });

      await prisma.rolePermission.upsert({
        where: {
          role_permission: {
            role: 5,
            permission: nameEn,
          },
        },
        update: { role: 5, permission: nameEn },
        create: { role: 5, permission: nameEn },
      });
    } else if (type === PermissionsType.VENDOR) {
      await prisma.rolePermission.upsert({
        where: {
          role_permission: {
            role: 3,
            permission: nameEn,
          },
        },
        update: { role: 3, permission: nameEn },
        create: { role: 3, permission: nameEn },
      });
    } else {
      await prisma.rolePermission.upsert({
        where: {
          role_permission: {
            role: 1,
            permission: nameEn,
          },
        },
        update: { role: 1, permission: nameEn },
        create: { role: 1, permission: nameEn },
      });
    }
  }
}
