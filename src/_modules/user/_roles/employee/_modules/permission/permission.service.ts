import { Injectable } from '@nestjs/common';
import { PermissionsType, Roles } from '@prisma/client';
import { localizedObject } from 'src/globals/helpers/localized.return';
import { PrismaService } from 'src/globals/services/prisma.service';
@Injectable()
export class PermissionService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    role: Role,
    locale: Locale,
  ): Promise<{ permissions: [{ name: string }]; total: number }> {
    const permissions = await this.prisma.permissions.findMany({
      where: {
        OR: [
          {
            type:
              role.baseRole === Roles.ADMIN
                ? PermissionsType.ADMIN
                : PermissionsType.STORE,
          },
          {
            type: PermissionsType.GLOBAL,
          },
        ],
      },
      select: {
        nameAr: true,
        nameEn: true,
      },
    });
    const total = await this.prisma.permissions.count({
      where: {
        OR: [
          {
            type:
              role.baseRole === Roles.ADMIN
                ? PermissionsType.ADMIN
                : PermissionsType.STORE,
          },
          {
            type: PermissionsType.GLOBAL,
          },
        ],
      },
    });
    return { permissions: localizedObject(permissions, locale), total } as {
      permissions: [{ name: string }];
      total: number;
    };
  }
}
