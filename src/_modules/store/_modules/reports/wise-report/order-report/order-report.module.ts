import { Module } from '@nestjs/common';
import { OrderReportController } from './order-report.controller';
import { OrderReportService } from './order-report.service';

@Module({
  imports: [],
  controllers: [OrderReportController],
  providers: [OrderReportService],
  exports: [],
})
export class OrderReportModule {}
