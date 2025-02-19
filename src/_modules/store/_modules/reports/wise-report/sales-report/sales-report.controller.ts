import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { LocaleHeader } from 'src/_modules/authentication/decorators/locale.decorator';
import { ApiFilter } from 'src/decorators/api/filter.decorator';
import { Filter } from 'src/decorators/param/filter.decorator';
import { ResponseService } from 'src/globals/services/response.service';
import { FilterSalesReportDTO } from './dto/sales-report.dto';
import { SalesReportService } from './sales-report.service';

@Controller('wise-report/sales-report')
@ApiTags('Store Wise reports')
export class SalesReportController {
  constructor(
    private readonly service: SalesReportService,
    private readonly responses: ResponseService,
  ) {}

  @Get('/')
  @ApiFilter(FilterSalesReportDTO)
  async getSalesReport(
    @Res() res: Response,
    @Filter({ dto: FilterSalesReportDTO }) filters: FilterSalesReportDTO,
    @LocaleHeader() locale: Locale,
  ) {
    const data = await this.service.getCards(filters, locale);
    return this.responses.success(res, locale, 'Get Data Successfully', data);
  }
}
