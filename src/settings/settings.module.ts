import { Module, OnModuleInit } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsProvider } from './settings.provider';
import { SettingsService } from './settings.service';

@Module({
  imports: [],
  controllers: [SettingsController],
  providers: [SettingsService, SettingsProvider],
  exports: [SettingsService],
})
export class SettingsModule implements OnModuleInit {
  constructor(private settingProvider: SettingsProvider) {}

  async onModuleInit() {
    if (env('SYNCABLE') !== 'TRUE') return;
    await this.settingProvider.syncSettings();
  }
}
