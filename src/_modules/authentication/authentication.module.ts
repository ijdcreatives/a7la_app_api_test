import { Module } from '@nestjs/common';
import { MailService } from 'src/globals/services/email.service';
import { UserService } from '../user/user.service';
import { GuestOTPService } from './_modules/otp/guest-otp.service';
import { UserOTPService } from './_modules/otp/user-otp.service';
import { BaseAuthenticationController } from './controllers/base.controller';
import { OTPAuthenticationController } from './controllers/otp.authentication.controller';
import { PasswordAuthenticationController } from './controllers/password.authentication.controller';
import { BaseAuthenticationService } from './services/base.authentication.service';
import { TokenService } from './services/jwt.service';
import { OTPAuthenticationService } from './services/otp.authentication.service';
import { PasswordAuthenticationService } from './services/password.authentication.service';
import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { ForgetPasswordTokenStrategy } from './strategies/forget-password-token.strategy';
import { VisitorStrategy } from './strategies/visitor.strategy';

@Module({
  // imports: [forwardRef(() => UserModule)],
  controllers: [
    OTPAuthenticationController,
    BaseAuthenticationController,
    PasswordAuthenticationController,
  ],
  providers: [
    TokenService,
    UserOTPService,
    GuestOTPService,
    MailService,
    OTPAuthenticationService,
    BaseAuthenticationService,
    AccessTokenStrategy,
    ForgetPasswordTokenStrategy,
    PasswordAuthenticationService,
    VisitorStrategy,
    UserService,
  ],
  exports: [
    BaseAuthenticationService,
    OTPAuthenticationService,
    GuestOTPService,
    UserOTPService,
    TokenService,
  ],
})
export class AuthenticationModule {}
