import { Module } from '@nestjs/common';
import { DeliveryBankController } from './bank.controller';
import { DeliveryBankService } from './bank.service';

@Module({
  imports: [],
  controllers: [DeliveryBankController],
  providers: [DeliveryBankService],
  exports: [],
})
export class DeliveryBankModule {}
