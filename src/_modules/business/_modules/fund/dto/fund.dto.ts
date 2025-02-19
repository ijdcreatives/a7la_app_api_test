import { Required } from 'src/decorators/dto/required-input.decorator';

export class CreateFundDTO {
  @Required()
  customerId: number;

  @Required()
  price: number;
}
