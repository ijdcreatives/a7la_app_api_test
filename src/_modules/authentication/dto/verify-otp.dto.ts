import { ValidateEmailOrPhone } from 'src/decorators/dto/validators/validate-email-or-phone.decorator';
import { ValidateOTP } from 'src/decorators/dto/validators/validate-otp.decorator';
import { ValidatePhone } from 'src/decorators/dto/validators/validate-phone.decorator';

export class VerifyOtpDTO {
  @ValidatePhone()
  phone: string;

  @ValidateOTP()
  otp: string;
}

export class VerifyAccountDTO {
  @ValidateEmailOrPhone()
  emailOrPhone: string;

  @ValidateOTP()
  otp: string;
}
