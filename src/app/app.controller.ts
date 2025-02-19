import { Controller, Get, Res } from '@nestjs/common';
import { ApiQuery, PartialType } from '@nestjs/swagger';
import { Response } from 'express';
import { LocaleHeader } from 'src/_modules/authentication/decorators/locale.decorator';
import { Filter } from 'src/decorators/param/filter.decorator';
import { PaginationParamsDTO } from 'src/dtos/params/pagination-params.dto';
import { PrismaService } from 'src/globals/services/prisma.service';
import { ResponseService } from 'src/globals/services/response.service';
import { AppService } from './app.service';
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
    private readonly responses: ResponseService,
  ) {}

  @Get('/city')
  @ApiQuery({ type: PartialType(PaginationParamsDTO) })
  async getCities(
    @Res() res: Response,
    @LocaleHeader() locale: Locale,
    @Filter({ dto: PaginationParamsDTO }) filters: PaginationParamsDTO,
  ) {
    const { cities, total } = await this.appService.getCities(locale, filters);
    return this.responses.success(
      res,
      locale,
      'get_cities_successfully',

      cities,
      {
        total,
      },
    );
  }

  @Get('/nationality')
  @ApiQuery({ type: PartialType(PaginationParamsDTO) })
  async getNationalities(
    @Res() res: Response,
    @LocaleHeader() locale: Locale,
    @Filter({ dto: PaginationParamsDTO }) filters: PaginationParamsDTO,
  ) {
    const { data, total } = await this.appService.getNationalities(
      locale,
      filters,
    );
    return this.responses.success(
      res,
      locale,
      'get_nationalities_successfully',

      data,
      {
        total,
      },
    );
  }

  @Get()
  getHello() {
    return this.appService.getHello();
  }
}
