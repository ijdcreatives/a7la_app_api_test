import { Module, OnModuleInit } from '@nestjs/common';
// import { WalletService } from 'src/_modules/order/service/wallet.service';
import { TransactionHelperService } from 'src/_modules/transaction/service/transaction.helper.service';
import { TransactionService } from 'src/_modules/transaction/service/transaction.service';
import { PlanController } from './plan.controller';
import { PlanProvider } from './plan.provider';
import { PlanHelperService } from './service/plan.helper.service';
import { PlanService } from './service/plan.service';

@Module({
  imports: [],
  controllers: [PlanController],
  providers: [
    PlanService,
    PlanProvider,
    TransactionService,
    PlanHelperService,
    TransactionHelperService,
    //back again
    // WalletService,
  ],
})
export class PlanModule implements OnModuleInit {
  constructor(private readonly service: PlanProvider) {}
  async onModuleInit() {
    if (env('SYNCABLE') !== 'TRUE') return;
    await this.service.syncPlans();
  }
}
