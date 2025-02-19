import { Injectable } from '@nestjs/common';
import { Roles } from '@prisma/client';
import { localizedObject } from 'src/globals/helpers/localized.return';
import { PrismaService } from 'src/globals/services/prisma.service';
import { Permission } from './interfaces/permission.interface';

@Injectable()
export class AuthorizationService {
  constructor(private readonly prisma: PrismaService) {}

  async getPermissions(role: Role, locale: Locale, storeId: Id) {
    const permissions = await this.prisma.rolePermission.findMany({
      where: {
        role: role.id,
      },
      select: {
        Permission: {
          select: {
            nameAr: true,
            nameEn: true,
          },
        },
      },
    });
    const anotherDate = [];
    if (role.baseRole === Roles.ADMIN) {
      anotherDate.push(
        {
          Permission: {
            nameEn: 'Chat',
            nameAr: 'المحادثات',
          },
        },
        {
          Permission: {
            nameEn: 'Review',
            nameAr: 'التقييمات',
          },
        },
      );
    } else if (role.baseRole === Roles.VENDOR) {
      const plan = await this.prisma.store.findUnique({
        where: { id: storeId },
        select: { Plan: true },
      });
      if (plan.Plan.chat)
        anotherDate.push({
          Permission: {
            nameEn: 'Chat',
            nameAr: 'المحادثات',
          },
        });
      if (plan.Plan.review)
        anotherDate.push({
          Permission: {
            nameEn: 'Review',
            nameAr: 'التقييمات',
          },
        });
    }
    permissions.push(...anotherDate);

    const updatedPermissions = permissions.map((permission: Permission) => ({
      nameEn: permission.Permission.nameEn,
      id: permission.Permission.nameEn,
      nameAr: permission.Permission.nameAr,
    }));

    return localizedObject(updatedPermissions, locale);
  }
}
