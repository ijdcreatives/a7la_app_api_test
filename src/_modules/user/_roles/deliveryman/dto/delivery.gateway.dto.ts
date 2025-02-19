import { Required } from 'src/decorators/dto/required-input.decorator';
import { ValidateNumber } from 'src/decorators/dto/validators/validate-number.decorator';

export class UpdateLocationDTO {
  @Required()
  @ValidateNumber()
  lat: number;

  @Required()
  @ValidateNumber()
  lng: number;
}
