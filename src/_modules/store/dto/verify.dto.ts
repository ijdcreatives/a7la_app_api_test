import { ValidateOTP } from 'src/decorators/dto/validators/validate-otp.decorator';
import { ValidatePhone } from 'src/decorators/dto/validators/validate-phone.decorator';

export class PhoneVerifyDTO {
  id: number;

  @ValidatePhone()
  phone: string;

  @ValidateOTP()
  otp: string;
}
