import { Optional } from 'src/decorators/dto/optional-input.decorator';
import { ValidateNumber } from 'src/decorators/dto/validators/validate-number.decorator';

export class FilterBankDTO {
  @Optional()
  @ValidateNumber()
  storeId: Id;

  @Optional()
  @ValidateNumber()
  id: Id;

  @Optional()
  @ValidateNumber()
  bankId: Id;
}
