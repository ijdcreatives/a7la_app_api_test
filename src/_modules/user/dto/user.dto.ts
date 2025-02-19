import { IsString } from 'class-validator';
import { Optional } from 'src/decorators/dto/optional-input.decorator';
import { Required } from 'src/decorators/dto/required-input.decorator';
import { ValidateEmail } from 'src/decorators/dto/validators/validate-email.decorator';
import { ValidatePassword } from 'src/decorators/dto/validators/validate-password.decorator';
import { ValidatePhone } from 'src/decorators/dto/validators/validate-phone.decorator';

export class CreateUserDTO {
  @Required({ example: 'Fahd' })
  @IsString()
  firstName?: string;

  @Required({ example: 'Hakim' })
  @IsString()
  lastName?: string;

  @ValidateEmail()
  email?: string;

  @ValidatePassword({ required: false })
  password?: string;

  @Optional({ type: String, format: 'binary', required: false })
  image?: string;

  @Optional()
  @ValidatePhone()
  phone?: string;
}
