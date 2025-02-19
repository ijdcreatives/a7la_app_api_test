import { ValidateEmail } from 'src/decorators/dto/validators/validate-email.decorator';
import { ValidatePassword } from 'src/decorators/dto/validators/validate-password.decorator';

export class AdminLoginDTO {
  @ValidateEmail()
  email: string;

  @ValidatePassword()
  password: string;
}
