import { Module } from '@nestjs/common';
import { ModuleStatisticsController } from './statistics.controller';
import { ModuleStatisticsService } from './statistics.service';

@Module({
  controllers: [ModuleStatisticsController],
  providers: [ModuleStatisticsService],
  exports: [ModuleStatisticsService],
})
export class ModuleStatisticsModule {}
