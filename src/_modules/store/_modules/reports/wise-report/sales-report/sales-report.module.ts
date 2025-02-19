import { Module } from '@nestjs/common';
import { SalesReportController } from './sales-report.controller';
import { SalesReportService } from './sales-report.service';

@Module({
  imports: [],
  controllers: [SalesReportController],
  providers: [SalesReportService],
  exports: [],
})
export class SalesReportModule {}
