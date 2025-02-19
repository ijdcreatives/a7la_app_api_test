import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '@prisma/client';
import { Response } from 'express';
import { Auth } from 'src/_modules/authentication/decorators/auth.decorator';
import { ApiFilter } from 'src/decorators/api/filter.decorator';
import { Filter } from 'src/decorators/param/filter.decorator';
import { ResponseService } from 'src/globals/services/response.service';
import { ModuleStatisticsFilterDTO } from './dtos/filter.dto';
import { ModuleStatisticsService } from './statistics.service';
import { LocaleHeader } from 'src/_modules/authentication/decorators/locale.decorator';

@Controller('module-statistics')
@ApiFilter(ModuleStatisticsFilterDTO, true)
@Auth({ roles: [Roles.ADMIN] })
@ApiTags('module-statistics')
export class ModuleStatisticsController {
  constructor(
    private readonly moduleStatisticsService: ModuleStatisticsService,
    private readonly responses: ResponseService,
  ) {}

  @Get('cards')
  async getCards(
    @Res() res: Response,
    @LocaleHeader() locale: Locale,
    @Filter({ dto: ModuleStatisticsFilterDTO })
    filters: ModuleStatisticsFilterDTO,
  ) {
    const data = await this.moduleStatisticsService.getCards(filters);
    return this.responses.success(
      res,
      locale,
      'Get Statistics Successfully',

      data,
    );
  }

  @Get('monthly-chart')
  async getMonthlyChart(
    @Res() res: Response,
    @LocaleHeader() locale: Locale,
    @Filter({ dto: ModuleStatisticsFilterDTO })
    filters: ModuleStatisticsFilterDTO,
  ) {
    const data = await this.moduleStatisticsService.getMonthlyChart(filters);
    return this.responses.success(
      res,
      locale,
      'Get Statistics Successfully',

      data,
    );
  }

  @Get('users-chart')
  async getUsersStatistics(
    @Res() res: Response,
    @LocaleHeader() locale: Locale,
    @Filter({ dto: ModuleStatisticsFilterDTO })
    filters: ModuleStatisticsFilterDTO,
  ) {
    const data = await this.moduleStatisticsService.getUsersStatistics(filters);
    return this.responses.success(
      res,
      locale,
      'Get Statistics Successfully',

      data,
    );
  }

  @Get('counts')
  async getCounts(
    @Res() res: Response,
    @LocaleHeader() locale: Locale,
    @Filter({ dto: ModuleStatisticsFilterDTO })
    filters: ModuleStatisticsFilterDTO,
  ) {
    const data = await this.moduleStatisticsService.getCounts(filters);
    return this.responses.success(
      res,
      locale,
      'Get Statistics Successfully',

      data,
    );
  }
}
