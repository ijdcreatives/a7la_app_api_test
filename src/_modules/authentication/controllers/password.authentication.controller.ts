import { Body, Controller, Patch, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ResponseService } from 'src/globals/services/response.service';
import { Auth } from '../decorators/auth.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { ChangePasswordDTO } from '../dto/change-password.dto';
import { PasswordAuthenticationService } from '../services/password.authentication.service';
import { LocaleHeader } from '../decorators/locale.decorator';

@Controller('authentication')
@ApiTags('Authentication')
export class PasswordAuthenticationController {
  constructor(
    private readonly authenticationService: PasswordAuthenticationService,
    private readonly responses: ResponseService,
  ) {}

  // @Post('/customer/login')
  // @ApiBody({ type: EmailPasswordLoginDTO })
  // async login(
  //   @Res() res: Response,
  //   @Body() credentials: EmailPasswordLoginDTO,
  // ) {
  //   const { user, accessToken } = await this.authenticationService.login(
  //     credentials,
  //     Roles.CUSTOMER,
  //   );
  //   res.cookie(env('ACCESS_TOKEN_COOKIE_KEY'), accessToken, cookieConfig);
  //   return this.responses.success(res,locale, `loggedIn`, {
  //     user,
  //     accessToken,
  //   });
  // }

  // @Post('verify-account')
  // async verifyAccount(@Res() res: Response, @Body() body: VerifyAccountDTO) {
  //   const { emailOrPhone, otp } = body;
  //   await this.authenticationService.verifyRegistrationOTP(emailOrPhone, otp);
  //   return this.responses.success(res,locale, 'accountVerified');
  // }

  @Patch('/change-password')
  @Auth()
  async changePassword(
    @Res() res: Response,
    @Body() body: ChangePasswordDTO,
    @CurrentUser('id') userId: Id,
    @CurrentUser('role') role: Role,
    @LocaleHeader() locale: Locale,
  ) {
    const { password } = body;
    await this.authenticationService.changePassword(userId, password, role);
    return this.responses.success(res, locale, 'Password Changed Successfully');
  }
}
