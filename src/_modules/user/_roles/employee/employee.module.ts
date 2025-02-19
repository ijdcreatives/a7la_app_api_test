import { Module, forwardRef } from '@nestjs/common';
import { AuthenticationModule } from 'src/_modules/authentication/authentication.module';
import { UserModule } from '../../user.module';
import { DeliveryBankModule } from './_modules/bank/bank.module';
import { PermissionModule } from './_modules/permission/permission.module';
import { RoleModule } from './_modules/role/role.module';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => AuthenticationModule),
    RoleModule,
    PermissionModule,
    DeliveryBankModule,
  ],
  controllers: [EmployeeController],
  providers: [EmployeeService],
  exports: [],
})
export class EmployeeModule {}
