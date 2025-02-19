import { forwardRef, Module } from '@nestjs/common';

import { AuthenticationModule } from '../authentication/authentication.module';
import { AdminModule } from './_roles/admin/admin.module';
import { CustomerModule } from './_roles/customer/customer.module';
import { DeliveryModule } from './_roles/deliveryman/delivery.module';
import { EmployeeModule } from './_roles/employee/employee.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    CustomerModule,
    AdminModule,
    DeliveryModule,
    EmployeeModule,
    forwardRef(() => AuthenticationModule),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
