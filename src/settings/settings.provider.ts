import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/globals/services/prisma.service';
import { Setting, settingTypes } from './settings';

[];

@Injectable()
export class SettingsProvider {
  constructor(private readonly prisma: PrismaService) {}

  async syncSettings() {
    for (const setting of settingTypes as readonly Setting[]) {
      await this.prisma.settings.upsert({
        where: { setting: setting.setting },
        update: {},
        create: {
          setting: setting.setting,
          domain: setting.domain,
          value: setting.value,
          dataType: setting.type,
          enumValues: setting?.enum,
        },
      });
    }
  }
}
