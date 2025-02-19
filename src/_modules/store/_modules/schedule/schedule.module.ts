import { Module } from '@nestjs/common';
import { PrismaService } from 'src/globals/services/prisma.service';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';

@Module({
  imports: [],
  controllers: [ScheduleController],
  providers: [PrismaService, ScheduleService],
  exports: [ScheduleService],
})
export class ScheduleModule {}
