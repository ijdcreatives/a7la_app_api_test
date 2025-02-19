import { Injectable } from '@nestjs/common';
import { CreatedBy, Prisma, Zone } from '@prisma/client';
import { firstOrMany } from 'src/globals/helpers/first-or-many';
import { localizedObject } from 'src/globals/helpers/localized.return';
import { PrismaService } from 'src/globals/services/prisma.service';
import { CreateZoneDTO, FilterZoneDTO, UpdateZoneDTO } from './dto/zone.dto';
import {
  getArgs,
  getArgsWithIncludeZone,
} from './prisma-args/zone.prisma.args';

@Injectable()
export class ZoneService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    tx: Prisma.TransactionClient,
    body: CreateZoneDTO & { createdBy?: CreatedBy; isActive: boolean },
  ) {
    const { displayDefault, points, createdBy, ...data } = body;
    const zone = await tx.zone.create({
      data: {
        nameAr: data.nameAr || 'Edited Zone',
        nameEn: data.nameEn || 'Edited Zone',
        displayAr: data.displayAr || 'Edited Zone',
        displayEn: data.displayEn || 'Edited Zone',
        isActive: body.isActive,
        ...(createdBy && { createdBy }),
        Point: {
          createMany: {
            data: points.map(({ lat, lng }) => ({ lat, lng })),
          },
        },
      },
    });
    return zone;
  }

  async update(id: Id, body: UpdateZoneDTO) {
    const { points, ...data } = body;
    await this.prisma.zone.update({
      where: {
        id,
      },
      data: {
        ...data,
        ...(points && {
          Point: {
            deleteMany: {},
            createMany: {
              data: points.map(({ lat, lng }) => ({ lat, lng })),
            },
          },
        }),
      },
    });
  }

  async delete(id: Id) {
    await this.prisma.store.updateMany({
      where: {
        zoneId: id,
      },
      data: {
        homeDelivery: false,
        zoneId: null,
      },
    });
    await this.prisma.zone.delete({
      where: {
        id,
      },
    });
  }
  async findAll(
    locale: Locale,
    filters: FilterZoneDTO,
    role: Role,
  ): Promise<Zone[]> {
    const args = getArgs(filters, locale, role.baseRole);
    const selectArgs = getArgsWithIncludeZone(role.baseRole);
    const data = await this.prisma.zone[firstOrMany(filters?.id)]({
      ...args,
      ...selectArgs,
    });

    return localizedObject(data, locale, [
      'displayAr',
      'displayEn',
      'nameAr',
      'nameEn',
    ]) as Zone[];
  }
  async zoneCount(
    filters: FilterZoneDTO,
    locale: Locale,
    role: Role,
  ): Promise<number> {
    const args = getArgs(filters, locale, role.baseRole);
    const count = await this.prisma.zone.count({
      where: args.where,
    });
    return count;
  }

  async validateUnique(body: CreateZoneDTO | UpdateZoneDTO): Promise<boolean> {
    const zone = await this.prisma.zone.findFirst({
      where: { OR: [{ nameAr: body.nameAr }, { nameEn: body.nameEn }] },
    });
    return zone ? true : false;
  }
}
