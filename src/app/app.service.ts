import { Injectable } from '@nestjs/common';
import { DataType, SettingDomain } from '@prisma/client';
import { PaginationParamsDTO } from 'src/dtos/params/pagination-params.dto';
import { localizedObject } from 'src/globals/helpers/localized.return';
import { paginateOrNot } from 'src/globals/helpers/pagination-params';
import { PrismaService } from 'src/globals/services/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}
  getHello(): string {
    return 'Hello World!';
  }
  async syncSettings() {
    await this.prisma.settings.upsert({
      where: { setting: 'storeNearestByKM' },
      update: { value: '10000' },
      create: {
        value: '10000',
        dataType: DataType.NUMBER,
        setting: 'storeNearestByKM',
        domain: SettingDomain.STORE,
      },
    });
  }
  async getCities(
    locale: Locale,
    filters: PaginationParamsDTO,
  ): Promise<{ cities: any; total: number }> {
    const data = await this.prisma.city.findMany({
      ...paginateOrNot(filters, false),
      orderBy: {
        [locale.toLowerCase() === 'en' ? 'nameEn' : 'nameAr']: 'asc',
      },
    });
    const total = await this.prisma.city.count();
    return { cities: await localizedObject(data, locale), total };
  }

  async getNationalities(
    locale: Locale,
    filters: PaginationParamsDTO,
  ): Promise<{ data: any; total: number }> {
    const data = await this.prisma.nationality.findMany({
      ...paginateOrNot(filters, false),
      orderBy: {
        [locale.toLowerCase() === 'en' ? 'nameEn' : 'nameAr']: 'asc',
      },
    });
    const total = await this.prisma.nationality.count();
    return { data: await localizedObject(data, locale), total };
  }
}
