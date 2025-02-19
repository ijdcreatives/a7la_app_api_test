import { Module, forwardRef } from '@nestjs/common';
import { AuthenticationModule } from 'src/_modules/authentication/authentication.module';
import { UserModule } from '../../user.module';
import { WalletModule } from '../../../wallet/wallet.module';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => AuthenticationModule),
    WalletModule,
  ],
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [],
})
export class CustomerModule {}
