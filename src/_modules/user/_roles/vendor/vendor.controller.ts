import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '@prisma/client';
import { Response } from 'express';
import { Auth } from 'src/_modules/authentication/decorators/auth.decorator';
import { CurrentUser } from 'src/_modules/authentication/decorators/current-user.decorator';
import { ResponseService } from 'src/globals/services/response.service';
import { VendorService } from './vendor.service';
import { LocaleHeader } from 'src/_modules/authentication/decorators/locale.decorator';

@Controller('vendor')
@ApiTags('Vendor')
export class VendorController {
  constructor(
    private readonly service: VendorService,
    private readonly response: ResponseService,
  ) {}

  @Get('/')
  @Auth({ roles: [Roles.VENDOR] })
  async getVendor(
    @Res() res: Response,
    @CurrentUser('mainStoreId') storeId: Id,
    @LocaleHeader() locale: Locale,
  ) {
    const data = await this.service.getVendor(storeId);
    return this.response.success(
      res,
      locale,
      'Vendor Fetched Successfully',

      data,
    );
  }
}
