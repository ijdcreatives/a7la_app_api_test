import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { ApiQuery, ApiTags, PartialType } from '@nestjs/swagger';
import { Roles } from '@prisma/client';
import { Response } from 'express';
import { Auth } from 'src/_modules/authentication/decorators/auth.decorator';
import { LocaleHeader } from 'src/_modules/authentication/decorators/locale.decorator';
import { Filter } from 'src/decorators/param/filter.decorator';
import { PrismaService } from 'src/globals/services/prisma.service';
import { ResponseService } from 'src/globals/services/response.service';
import { CurrentUser } from '../authentication/decorators/current-user.decorator';
import { convertPoints, FilterLoyaltyPointDTO } from './dto/loyaltyPoint.dto';
import {
  FilterTransactionDTO,
  FilterTransactionReportDTO,
} from './dto/transaction.dto';
import { TransactionService } from './service/transaction.service';

const prefix = 'Transaction';

@Controller(prefix.toLowerCase())
export class TransactionController {
  constructor(
    private readonly service: TransactionService,
    private readonly responseService: ResponseService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('/convert-points')
  @ApiTags(prefix)
  @Auth({})
  async convertPoints(
    @Res() res: Response,
    @Body() body: convertPoints,
    @CurrentUser() currentUser: CurrentUser,
    @LocaleHeader() locale: Locale,
  ) {
    await this.service.convertPoints(body, currentUser.id);
    return this.responseService.success(
      res,
      locale,
      'Points Converted Successfully',
    );
  }

  @Get('/loyaltyPoint/statistics')
  @ApiQuery({ type: PartialType(FilterLoyaltyPointDTO) })
  @Auth({ roles: [Roles.ADMIN] })
  @ApiTags(prefix)
  async findLoyaltyPointStatistic(
    @Res() res: Response,
    @Filter({ dto: FilterLoyaltyPointDTO }) filters: FilterLoyaltyPointDTO,
    @LocaleHeader() locale: Locale,
  ) {
    const date = await this.service.findLoyaltyPointStatistic(filters);
    return this.responseService.success(
      res,
      locale,
      'transactions_fetched_successfully',

      date,
    );
  }
  @Get('/loyaltyPoint')
  @ApiQuery({ type: PartialType(FilterLoyaltyPointDTO) })
  @Auth({ roles: [Roles.ADMIN] })
  @ApiTags(prefix)
  async findLoyaltyPoint(
    @Res() res: Response,
    @Filter({ dto: FilterLoyaltyPointDTO }) filters: FilterLoyaltyPointDTO,
    @LocaleHeader() locale: Locale,
  ) {
    const date = await this.service.findLoyaltyPoint(filters);
    const total = await this.service.findTotalLoyaltyPoint(filters);
    return this.responseService.success(
      res,
      locale,
      'transactions_fetched_successfully',

      date,
      { total },
    );
  }

  @Get('/statistics')
  @ApiQuery({ type: PartialType(FilterTransactionDTO) })
  @Auth({ roles: [Roles.ADMIN] })
  @ApiTags(prefix)
  async findStatistic(
    @Res() res: Response,
    @Filter({ dto: FilterTransactionDTO }) filters: FilterTransactionDTO,
    @LocaleHeader() locale: Locale,
  ) {
    const date = await this.service.findStatistic(filters);
    return this.responseService.success(
      res,
      locale,
      'transactions_fetched_successfully',

      date,
    );
  }

  @Get('/report')
  @ApiQuery({ type: PartialType(FilterTransactionReportDTO) })
  @Auth({ roles: [Roles.ADMIN] })
  @ApiTags(prefix, 'Report Section')
  async findReport(
    @Res() res: Response,
    @LocaleHeader() locale: Locale,
    @Filter({ dto: FilterTransactionReportDTO })
    filters: FilterTransactionReportDTO,
  ) {
    const transactions = await this.service.findReport(locale, filters);
    const total = await this.service.findTotalReportTransactions(filters);

    return this.responseService.success(
      res,
      locale,
      'transactions_report_fetched_successfully',

      transactions,
      { total },
    );
  }
  @Get('/report-statistics')
  @ApiQuery({ type: PartialType(FilterTransactionReportDTO) })
  @Auth({ roles: [Roles.ADMIN] })
  @ApiTags(prefix, 'Report Section')
  async findReportStatistics(
    @Res() res: Response,
    @Filter({ dto: FilterTransactionReportDTO })
    filters: FilterTransactionReportDTO,
    @LocaleHeader() locale: Locale,
  ) {
    const statistics = await this.service.findReportStatistics(filters);

    return this.responseService.success(
      res,
      locale,
      'transactions_report_fetched_successfully',

      statistics,
    );
  }

  @Get('/')
  @ApiTags(prefix)
  @ApiQuery({ type: PartialType(FilterTransactionDTO) })
  @Auth({ roles: [Roles.ADMIN] })
  async findAll(
    @Res() res: Response,
    @LocaleHeader() locale: Locale,
    @Filter({ dto: FilterTransactionDTO }) filters: FilterTransactionDTO,
  ) {
    const transactions = await this.service.findAll(locale, filters);
    const total = await this.service.findTotalTransactions(filters);

    return this.responseService.success(
      res,
      locale,
      'transactions_fetched_successfully',

      transactions,
      { total },
    );
  }
}
