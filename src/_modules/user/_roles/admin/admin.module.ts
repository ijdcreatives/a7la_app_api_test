import { Module, forwardRef } from '@nestjs/common';
import { AuthenticationModule } from 'src/_modules/authentication/authentication.module';
import { UserModule } from '../../user.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => AuthenticationModule),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [],
})
export class AdminModule {}
