import { Module } from '@nestjs/common';
import { StoreBankController } from './bank.controller';
import { StoreBankService } from './bank.service';

@Module({
  imports: [],
  controllers: [StoreBankController],
  providers: [StoreBankService],
  exports: [],
})
export class StoreBankModule {}
