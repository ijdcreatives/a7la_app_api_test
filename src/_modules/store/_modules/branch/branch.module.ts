import { forwardRef, Module } from '@nestjs/common';
import { AuthenticationModule } from 'src/_modules/authentication/authentication.module';
import { ZoneService } from 'src/_modules/business/_modules/zone/zone.service';
import { VendorService } from 'src/_modules/user/_roles/vendor/vendor.service';
import { UserService } from 'src/_modules/user/user.service';
import { PrismaService } from 'src/globals/services/prisma.service';
import { StoreHelperService } from '../../services/helper.service';
import { StoreService } from '../../services/store.service';
import { StoreProvider } from '../../store.provider';
import { BranchController } from './branch.controller';
import { BranchService } from './branch.service';

@Module({
  imports: [forwardRef(() => AuthenticationModule)],
  controllers: [BranchController],
  providers: [
    BranchService,
    PrismaService,
    StoreProvider,
    VendorService,
    StoreHelperService,
    UserService,
    ZoneService,
    StoreService,
  ],
  exports: [BranchService, StoreProvider],
})
export class BranchModule {}
