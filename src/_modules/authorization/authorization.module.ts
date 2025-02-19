import { Global, Module, OnModuleInit } from '@nestjs/common';
import { AuthorizationController } from './authorization.controller';
import { AuthorizationService } from './authorization.service';
import { PermissionsProvider } from './permissions.provider';

@Global()
@Module({
  imports: [],
  controllers: [AuthorizationController],
  providers: [PermissionsProvider, AuthorizationService],
  exports: [],
})
export class AuthorizationModule implements OnModuleInit {
  constructor(private readonly permissionsProvider: PermissionsProvider) {}

  async onModuleInit() {
    if (env('SYNCABLE') !== 'TRUE') return;
    await this.permissionsProvider.superAdminInitiation();
    await this.permissionsProvider.syncPermissions();
  }
}
