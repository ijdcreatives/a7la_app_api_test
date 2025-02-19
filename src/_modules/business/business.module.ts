import { Module } from '@nestjs/common';
import { FundModule } from './_modules/fund/fund.module';

@Module({
  imports: [FundModule],
  controllers: [],
  providers: [],
})
export class BusinessModule {}
