import { ApiProperty } from '@nestjs/swagger';
import { Roles } from '@prisma/client';
import { Required } from 'src/decorators/dto/required-input.decorator';
import { ValidateEmail } from 'src/decorators/dto/validators/validate-email.decorator';
import { ValidatePhone } from 'src/decorators/dto/validators/validate-phone.decorator';
import { EnumArrayFilter } from 'src/decorators/filters/enum.filter.decorator';

export class ForgotPasswordDTO {
  @ValidateEmail()
  @ApiProperty({ example: 'fhakem75@gmail.com' })
  email: string;

  @Required()
  @ValidatePhone()
  phone: string;

  @EnumArrayFilter(Roles, 'roles', 'roles')
  role: Roles;
}
