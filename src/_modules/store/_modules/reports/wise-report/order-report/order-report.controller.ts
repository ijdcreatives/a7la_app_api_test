import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ApiFilter } from 'src/decorators/api/filter.decorator';
import { Filter } from 'src/decorators/param/filter.decorator';
import { ResponseService } from 'src/globals/services/response.service';
import { FilterOrderReportDTO } from './dto/order-report.dto';
import { OrderReportService } from './order-report.service';
import { LocaleHeader } from 'src/_modules/authentication/decorators/locale.decorator';

@Controller('wise-report/order-report')
@ApiTags('Store Wise reports')
export class OrderReportController {
  constructor(
    private readonly service: OrderReportService,
    private readonly responses: ResponseService,
  ) {}

  @Get('/')
  @ApiFilter(FilterOrderReportDTO)
  async getOrderReport(
    @Res() res: Response,
    @LocaleHeader() locale: Locale,
    @Filter({ dto: FilterOrderReportDTO }) filters: FilterOrderReportDTO,
  ) {
    const data = await this.service.getCards(filters);
    return this.responses.success(res, locale, 'Get Data Successfully', data);
  }
}
