import { forwardRef, Module } from '@nestjs/common';
import { PrismaService } from 'src/globals/services/prisma.service';
import { AuthenticationModule } from '../authentication/authentication.module';
import { ZoneService } from '../business/_modules/zone/zone.service';
import { TransactionHelperService } from '../transaction/service/transaction.helper.service';
import { TransactionService } from '../transaction/service/transaction.service';
import { VendorService } from '../user/_roles/vendor/vendor.service';
import { UserService } from '../user/user.service';
import { StoreBankModule } from './_modules/bank/bank.module';
import { BranchService } from './_modules/branch/branch.service';
import { OrderReportModule } from './_modules/reports/wise-report/order-report/order-report.module';
import { SalesReportModule } from './_modules/reports/wise-report/sales-report/sales-report.module';
import { SummaryReportModule } from './_modules/reports/wise-report/summary-report/summary-report.module';
import { StoreHelperService } from './services/helper.service';
import { StoreService } from './services/store.service';
import { StoreController } from './store.controller';
import { StoreProvider } from './store.provider';

@Module({
  imports: [
    forwardRef(() => AuthenticationModule),
    StoreBankModule,
    SummaryReportModule,
    SalesReportModule,
    OrderReportModule,
  ],
  controllers: [StoreController],
  providers: [
    StoreService,
    StoreHelperService,
    PrismaService,
    TransactionService,
    TransactionHelperService,
    StoreProvider,
    UserService,
    VendorService,
    ZoneService,
    BranchService,
  ],
  exports: [StoreService, StoreHelperService],
})
export class StoreModule {}
