import { PartialType } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsStrongPassword, Matches } from 'class-validator';
import { Required } from 'src/decorators/dto/required-input.decorator';
import { ValidatePhone } from 'src/decorators/dto/validators/validate-phone.decorator';
import { ValidateString } from 'src/decorators/dto/validators/validate-string.decorator';

export class CreateVendorDTO {
  @Required()
  name: string;

  @Required({ example: 'test@test.com' })
  @IsEmail()
  email: string;

  @Required({ example: 'Default@123' })
  @IsStrongPassword()
  password: string;

  @Required({})
  @ValidatePhone()
  phone: string;

  @Required({})
  @ValidateString()
  idNumber?: string;
}

export class UpdateVendorDTO extends PartialType(CreateVendorDTO) {}
