import { Module, OnModuleInit } from '@nestjs/common';
import { ModuleProvider } from './module.provider';
import { ModulesController } from './modules.controller';
import { ModulesService } from './modules.service';

@Module({
  controllers: [ModulesController],
  providers: [ModuleProvider, ModulesService],
})
export class ModulesModule implements OnModuleInit {
  constructor(private readonly moduleProvider: ModuleProvider) {}

  async onModuleInit() {
    if (env('SYNCABLE') !== 'TRUE') return;
    await this.moduleProvider.syncModules();
  }
}
