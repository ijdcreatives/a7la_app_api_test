import { Module } from '@nestjs/common';
import { SummaryReportController } from './summary-report.controller';
import { SummaryReportService } from './summary-report.service';

@Module({
  imports: [],
  controllers: [SummaryReportController],
  providers: [SummaryReportService],
  exports: [],
})
export class SummaryReportModule {}
