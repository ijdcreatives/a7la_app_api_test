import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { LocaleHeader } from 'src/_modules/authentication/decorators/locale.decorator';
import { ApiFilter } from 'src/decorators/api/filter.decorator';
import { Filter } from 'src/decorators/param/filter.decorator';
import { ResponseService } from 'src/globals/services/response.service';
import { FilterSummaryReportDTO } from './dto/summary-report.dto';
import { SummaryReportService } from './summary-report.service';

@Controller('wise-report/summary-report')
@ApiTags('Store Wise reports')
export class SummaryReportController {
  constructor(
    private readonly summaryReportService: SummaryReportService,
    private readonly responses: ResponseService,
  ) {}

  @Get('/')
  @ApiFilter(FilterSummaryReportDTO)
  async getSummaryReport(
    @Res()
    res: Response,
    @LocaleHeader() locale: Locale,
    @Filter({ dto: FilterSummaryReportDTO }) filter: FilterSummaryReportDTO,
  ) {
    const data = await this.summaryReportService.getCards(filter, locale);
    return this.responses.success(res, locale, 'Get Data Successfully', data);
  }
}
