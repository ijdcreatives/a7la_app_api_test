import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '@prisma/client';
import { Response } from 'express';
import { Auth } from 'src/_modules/authentication/decorators/auth.decorator';
import { FilterTransactionDTO } from 'src/_modules/transaction/dto/transaction.dto';
import { ApiFilter } from 'src/decorators/api/filter.decorator';
import { Filter } from 'src/decorators/param/filter.decorator';
import { ResponseService } from 'src/globals/services/response.service';
import { AddFundDTO } from './dto/add-fund.dto';
import { WalletService } from './wallet.service';
import { CurrentUser } from '../authentication/decorators/current-user.decorator';
import { LocaleHeader } from '../authentication/decorators/locale.decorator';
const prefix = 'Wallet';
@Controller('wallet')
@ApiTags('Wallet')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly responses: ResponseService,
  ) {}

  @Post('add-fund')
  @Auth({ roles: [Roles.ADMIN] })
  async addFund(
    @Res() res: Response,
    @Body() addFundDTO: AddFundDTO,
    @LocaleHeader() locale: Locale,
  ) {
    await this.walletService.addFund(addFundDTO);
    return this.responses.created(res, locale, 'Fund Added Successfully');
  }

  @Get('/report')
  @Auth({ roles: [Roles.ADMIN] })
  @ApiFilter(FilterTransactionDTO)
  async getReport(
    @Res() res: Response,
    @Filter({ dto: FilterTransactionDTO }) filters: any,
    @LocaleHeader() locale: Locale,
  ) {
    const { data, total } = await this.walletService.getReport(filters);
    return this.responses.success(
      res,
      locale,
      'Get Report Successfully',
      data,
      {
        total,
      },
    );
  }

  @Get('/report-statistics')
  @Auth({ roles: [Roles.ADMIN] })
  @ApiFilter(FilterTransactionDTO)
  async getReportStatistics(
    @Res() res: Response,
    @LocaleHeader() locale: Locale,
    @Filter({ dto: FilterTransactionDTO }) filters: any,
  ) {
    const data = await this.walletService.statistics(filters);
    return this.responses.success(
      res,
      locale,
      'Get Report Statistics Successfully',
      data,
    );
  }

  @Get('/store')
  @Auth({ roles: [Roles.VENDOR, Roles.MANAGER] })
  async findWallet(
    @Res() res: Response,
    @CurrentUser('storeId') storeId: Id,
    @LocaleHeader() locale: Locale,
  ) {
    const wallet = await this.walletService.findWallet(storeId);
    return this.responses.success(
      res,
      locale,
      'Get Store Wallet Successful',
      wallet,
    );
  }
}
