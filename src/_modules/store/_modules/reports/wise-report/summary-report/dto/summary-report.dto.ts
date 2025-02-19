import { PartialType } from '@nestjs/swagger';
import { FilterByTimeDTO } from 'src/dtos/params/time-params.dto';

export class FilterSummaryReportDTO extends PartialType(FilterByTimeDTO) {}
