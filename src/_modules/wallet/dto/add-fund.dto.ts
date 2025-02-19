import { IsString } from 'class-validator';
import { Optional } from 'src/decorators/dto/optional-input.decorator';
import { Required } from 'src/decorators/dto/required-input.decorator';
import { ValidateNumber } from 'src/decorators/dto/validators/validate-number.decorator';

export class AddFundDTO {
  @Required()
  @ValidateNumber()
  amount: number;

  @Required()
  @ValidateNumber()
  customerId: number;

  @Optional()
  @IsString()
  reference: string;
}
