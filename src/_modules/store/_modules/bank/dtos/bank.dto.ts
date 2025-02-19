import { PartialType } from '@nestjs/swagger';
import { IsIBAN } from 'class-validator';
import { Required } from 'src/decorators/dto/required-input.decorator';
import { ValidateNumber } from 'src/decorators/dto/validators/validate-number.decorator';
import { ValidatePhone } from 'src/decorators/dto/validators/validate-phone.decorator';
import { ValidateString } from 'src/decorators/dto/validators/validate-string.decorator';

export class AddBankDTO {
  storeId: Id;

  @Required()
  @ValidateString()
  name: string;

  @Required()
  @ValidateNumber()
  bankId: Id;

  @Required()
  @ValidateString()
  ownerName: string;

  @Required()
  @ValidateString()
  @IsIBAN()
  iban: string;

  @Required()
  @ValidatePhone()
  phone: string;
}

export class UpdateBankDTO extends PartialType(AddBankDTO) {}
