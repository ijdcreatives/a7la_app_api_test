import { Optional } from 'src/decorators/dto/optional-input.decorator';
import { Required } from 'src/decorators/dto/required-input.decorator';
import { ValidateDate } from 'src/decorators/dto/validators/validate-date.decorator';
import { ValidateNumber } from 'src/decorators/dto/validators/validate-number.decorator';

export class ModuleStatisticsFilterDTO {
  @Required()
  @ValidateNumber()
  moduleId: number;

  @Optional()
  @ValidateDate()
  dateFrom?: Date;

  @Optional()
  @ValidateDate()
  dateTo?: Date;
}
