import { Module, forwardRef } from '@nestjs/common';
import { AuthenticationModule } from '../../../../../authentication/authentication.module';
import { UserModule } from '../../../../user.module';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => AuthenticationModule),
  ],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [],
})
export class RoleModule {}
