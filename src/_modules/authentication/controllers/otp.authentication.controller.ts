import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ResponseService } from 'src/globals/services/response.service';
import { TokenService } from '../services/jwt.service';
import { OTPAuthenticationService } from '../services/otp.authentication.service';

@Controller('authentication')
@ApiTags('Authentication')
export class OTPAuthenticationController {
  constructor(
    private readonly authenticationService: OTPAuthenticationService,
    private readonly tokenService: TokenService,
    private readonly responses: ResponseService,
  ) {}

  // @Post('/:role/login-otp')
  // @RoleParam()
  // async loginOtp(
  //   @Res() res: Response,
  //   @Body() { phone }: PhoneOTPLoginRequestDTO,
  //   @Param() { role }: RoleDTO,
  // ) {
  //   await this.authenticationService.requestLoginOTP(phone, role);
  //   return this.responses.success(res,locale, `otpSent`);
  // }

  // @Post('/:role/login')
  // @RoleParam()
  // async login(
  //   @Res() res: Response,
  //   @Body() credentials: PhoneOTPLoginDTO,
  //   @Param() { role }: RoleDTO,
  // ) {
  //   const { user, accessToken } = await this.authenticationService.loginWithOTP(
  //     credentials,
  //     role,
  //   );
  //   res.cookie(env('ACCESS_TOKEN_COOKIE_KEY'), accessToken, cookieConfig);
  //   return this.responses.success(res,locale, `loggedIn`, {
  //     user,
  //     accessToken,
  //   });
  // }

  // @Post('verify-otp')
  // async verifyOTP(@Res() res: Response, @Body() body: VerifyOtpDTO) {
  //   const { phone, otp } = body;
  //   const token = await this.authenticationService.verifyRegistrationOTP(
  //     phone,
  //     otp,
  //   );
  //   return this.responses.success(res,locale, 'otpVerified', {
  //     token,
  //   });
  // }
}
