import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Roles, RoleType } from '@prisma/client';
import { I18nService } from 'nestjs-i18n';
import { firstOrMany } from '../../../../../../globals/helpers/first-or-many';
import { localizedObject } from '../../../../../../globals/helpers/localized.return';
import { PrismaService } from '../../../../../../globals/services/prisma.service';
import { UserService } from '../../../../user.service';
import { CreateRoleDTO, FindRoleDTO, UpdateRoleDTO } from './dto/role.dto';
import { getOrderArgs } from './prisma-args/roles.prisma-args';
@Injectable()
export class RoleService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    private prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  async create(body: CreateRoleDTO, baseRole: Roles, storeId?: Id) {
    await this.prisma.$transaction(async (prisma) => {
      const { id } = await prisma.role.create({
        data: {
          nameAr: body.nameAr,
          nameEn: body.nameEn,
          type: baseRole === Roles.ADMIN ? RoleType.ADMIN : RoleType.STORE,
          storeId,
        },
      });
      for (const permission of body.permissions) {
        await prisma.rolePermission.create({
          data: { role: id, permission },
        });
      }
    });
  }

  async update(
    body: UpdateRoleDTO,
    id: Id,
    role: Role,
    locale: Locale,
    storeId?: Id,
  ) {
    const { permissions, ...roleBody } = body;
    const data = await this.prisma.role.findUnique({ where: { id } });
    this.validateRole(data, role.baseRole, storeId, locale);
    await this.prisma.$transaction(async (prisma) => {
      await prisma.role.update({
        where: { id },
        data: {
          ...roleBody,
        },
      });
      if (permissions) {
        await this.prisma.rolePermission.deleteMany({
          where: { role: id },
        });
        for (const permission of permissions) {
          await prisma.rolePermission.create({
            data: { role: id, permission },
          });
        }
      }
    });
  }

  async delete(id: Id, role: Role, storeId: Id, locale: Locale) {
    const data = await this.prisma.role.findUnique({ where: { id } });
    this.validateRole(data, role.baseRole, storeId, locale);
    await this.prisma.role.delete({ where: { id } });
  }

  async findAll(
    locale: Locale,
    filters: FindRoleDTO,
    baseRole: Roles,
    storeId: Id,
  ) {
    const data = await this.prisma.role[firstOrMany(filters?.id)]({
      ...getOrderArgs(filters, locale, baseRole, storeId, baseRole),
      select: {
        id: true,
        nameEn: true,
        nameAr: true,
        storeId: true,
        type: true,
        RolePermission: {
          select: {
            permission: true,
          },
        },
      },
    });
    if (filters.id) this.validateRole(data, baseRole, storeId, locale);

    const total = await this.prisma.role.count({
      where: getOrderArgs(filters, locale, baseRole, storeId, baseRole).where,
    });
    return {
      data: localizedObject(data, locale, ['nameEn', 'nameAr']),
      total,
    };
  }

  async validateUnique(
    body: CreateRoleDTO | UpdateRoleDTO,
    storeId: Id,
    baseRole: Roles,
    locale: Locale,
  ) {
    const { nameEn, nameAr } = body;
    if (body.permissions?.length === 0) {
      throw new BadRequestException('please add at least one permission');
    }
    if (nameEn || nameAr) {
      const role = await this.prisma.role.findFirst({
        where: {
          OR: [{ nameEn }, { nameAr }],
          storeId: baseRole === Roles.VENDOR ? storeId : undefined,
          type: baseRole === Roles.ADMIN ? RoleType.ADMIN : RoleType.STORE,
        },
      });

      if (role)
        throw new ConflictException(this.i18n.translate('Name Already Exists'));
    }
    if (body.permissions) {
      for (const permission of body.permissions) {
        const permissionExist = await this.prisma.rolePermission.findFirst({
          where: { permission },
        });
        if (!permissionExist)
          throw new NotFoundException('Permission Not Found');
      }
    }
  }

  private validateRole(
    role: any,
    baseRole: Roles,
    storeId: Id,
    locale: Locale,
  ) {
    if (
      (role['type'] === RoleType.ADMIN && baseRole !== Roles.ADMIN) ||
      (role['type'] === RoleType.STORE && baseRole !== Roles.VENDOR)
    )
      throw new NotFoundException('Role Not Found');

    if (baseRole === Roles.VENDOR && storeId !== role['storeId']) {
      throw new NotFoundException('Store Not Found');
    }
  }
}
