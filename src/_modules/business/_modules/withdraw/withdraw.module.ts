import { Module } from '@nestjs/common';
import { WithdrawHelperService } from './services/withdraw.helper.service';
import { WithdrawService } from './services/withdraw.service';
import { WithdrawController } from './withdraw.controller';

@Module({
  imports: [],
  controllers: [WithdrawController],
  providers: [WithdrawService, WithdrawHelperService],
})
export class WithdrawModule {}
