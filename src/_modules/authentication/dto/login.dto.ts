import { Roles } from '@prisma/client';
import { IsString } from 'class-validator';
import { Optional } from 'src/decorators/dto/optional-input.decorator';
import { Required } from 'src/decorators/dto/required-input.decorator';
import { ValidateEmail } from 'src/decorators/dto/validators/validate-email.decorator';
import { ValidateOTP } from 'src/decorators/dto/validators/validate-otp.decorator';
import { ValidatePassword } from 'src/decorators/dto/validators/validate-password.decorator';
import { ValidatePhone } from 'src/decorators/dto/validators/validate-phone.decorator';
import { EnumArrayFilter } from 'src/decorators/filters/enum.filter.decorator';

class LoginInfoDTO {
  @Optional({ example: 'user' })
  @IsString()
  fcm?: string;

  @Required({})
  @EnumArrayFilter(Roles, 'role', 'Role')
  role: Roles;
}

export class PhoneOTPLoginRequestDTO {
  @ValidatePhone()
  phone: string;
}
export class PhoneOTPLoginDTO extends LoginInfoDTO {
  @ValidatePhone()
  phone: string;

  @ValidateOTP()
  otp: string;
}

export class EmailPasswordLoginDTO extends LoginInfoDTO {
  @ValidateEmail()
  email: string;

  @ValidatePassword()
  password: string;
}

export class LoginDto {
  @Optional({ example: 'user' })
  @IsString()
  fcm?: string;

  @EnumArrayFilter(Roles, 'role', 'Role')
  role?: Roles;

  @Optional()
  @ValidatePhone()
  phone?: string;

  @Optional()
  @ValidateOTP()
  otp?: string;

  @Optional()
  @ValidateEmail()
  email?: string;

  @Optional()
  @ValidatePassword()
  password?: string;
}
enum RolesCanLoginWithPhone {
  CUSTOMER = 'CUSTOMER',
}
export class RequestOtpDto {
  @ValidatePhone()
  phone: string;

  @EnumArrayFilter(RolesCanLoginWithPhone, 'role', 'Role')
  role?: RolesCanLoginWithPhone;
}
