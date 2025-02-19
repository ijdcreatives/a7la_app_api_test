import { Injectable } from '@nestjs/common';
import { DataType } from '@prisma/client';
import { PrismaService } from './prisma.service';
import { SettingKey } from 'src/settings/settings';

@Injectable()
export class SettingService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings(
    key: SettingKey | SettingKey[],
  ): Promise<Record<SettingKey, any>> {
    let isOne = false;
    if (typeof key === 'string') {
      isOne = true;
      key = [key];
    }

    const settings = await this.prisma.settings?.findMany({
      where: { setting: { in: key } },
    });

    const processedSettings = settings?.map((s) => {
      let value: any = s.value;
      if (s.dataType === DataType.NUMBER) value = Number(s.value);
      if (s.dataType === DataType.BOOLEAN) value = Boolean(s.value);
      if (s.dataType === DataType.DATE) value = new Date(s.value);
      if (s.dataType === DataType.TIME) value = new Date(s.value);

      return { [s.setting]: value };
    });
    if (isOne) return processedSettings?.at(0) as any;

    const returnedSettings = {};
    processedSettings.forEach((setting) => {
      const key = Object.keys(setting)[0];
      returnedSettings[key] = setting[key];
    });

    return returnedSettings as any;
  }
}
