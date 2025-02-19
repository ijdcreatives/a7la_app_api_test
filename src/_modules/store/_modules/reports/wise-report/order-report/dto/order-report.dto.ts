import { Optional } from 'src/decorators/dto/optional-input.decorator';
import { ValidateNumberArray } from 'src/decorators/dto/validators/validate-number.decorator';
import { FilterByTimeDTO } from 'src/dtos/params/time-params.dto';

export class FilterOrderReportDTO extends FilterByTimeDTO {
  @Optional()
  id?: Id;

  @Optional()
  @ValidateNumberArray()
  zoneId?: Id | Id[];

  @Optional()
  @ValidateNumberArray()
  storeId?: Id | Id[];
}
