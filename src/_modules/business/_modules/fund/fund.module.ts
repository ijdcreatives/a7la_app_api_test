import { Module } from '@nestjs/common';
import { TransactionHelperService } from 'src/_modules/transaction/service/transaction.helper.service';
import { TransactionService } from 'src/_modules/transaction/service/transaction.service';
import { FundController } from './fund.controller';
import { FundService } from './fund.service';

@Module({
  imports: [],
  controllers: [FundController],
  providers: [FundService, TransactionService, TransactionHelperService],
})
export class FundModule {}
