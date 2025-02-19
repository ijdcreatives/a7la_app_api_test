import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Roles, SessionType } from '@prisma/client';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { CurrentUser } from 'src/_modules/authentication/decorators/current-user.decorator';
import { UserService } from 'src/_modules/user/user.service';
import { cookieConfig } from 'src/configs/cookie.config';
import { PrismaService } from 'src/globals/services/prisma.service';
import { ResponseService } from 'src/globals/services/response.service';
import { GuestOTPService } from '../_modules/otp/guest-otp.service';
import { Auth } from '../decorators/auth.decorator';
import { LocaleHeader } from '../decorators/locale.decorator';
import { EnableFaceIdDTO } from '../dto/face-id.dto';
import { ForgotPasswordDTO } from '../dto/forgot-password.dto';
import { LoginWithFaceId } from '../dto/login-faceId.dto';
import { LoginDto, RequestOtpDto } from '../dto/login.dto';
import { ResetPasswordDTO } from '../dto/reset-password.dto';
import { userJoinedRole } from '../helpers/role-helper';
import { BaseAuthenticationService } from '../services/base.authentication.service';
import { TokenService } from '../services/jwt.service';
import { RoleService } from 'src/_modules/user/_roles/employee/_modules/role/role.service';
import { ApiRequiredIdParam } from 'src/decorators/api/id-params.decorator';
import { RequiredIdParam } from 'src/dtos/params/id-param.dto';
import { PhoneVerifyDTO } from 'src/_modules/user/_roles/deliveryman/dto/delivery.dto';

@Controller('authentication')
@ApiTags('Authentication')
export class BaseAuthenticationController {
  constructor(
    private readonly authenticationService: BaseAuthenticationService,
    private readonly responses: ResponseService,
    private readonly i18n: I18nService,
  ) {}

  @Post('enable-faceId')
  @ApiOperation({
    summary: 'Enable FaceId For All Users',
  })
  @Auth({
    roles: [Roles.CUSTOMER, Roles.VENDOR, Roles.DELIVERY, Roles.SPECIALIST],
  })
  async enableFaceId(
    @Res() res: Response,
    @Body() enableFaceIdDTO: EnableFaceIdDTO,
    @CurrentUser() currentUser: CurrentUser,
    @CurrentUser('role') role: Role,
    @LocaleHeader() locale: Locale,
  ) {
    await this.authenticationService.enableFaceId(
      currentUser,
      enableFaceIdDTO,
      role,
    );
    return this.responses.success(res, locale, 'FaceId Enabled');
  }

  @Post('/verify/:id')
  @ApiRequiredIdParam()
  async verifyStore(
    @Res() res: Response,
    @Param() { id }: RequiredIdParam,
    @Body() body: PhoneVerifyDTO,
    @LocaleHeader() locale: Locale,
  ) {
    body.id = id;
    await this.authenticationService.verify(body, locale);
    return this.responses.success(res, locale, 'Phone Number Verified');
  }

  @Post('facial-recognition')
  @ApiOperation({
    summary:
      'Login For All Users [Phone , OTP] For Customer and DeliveryMan [Email , Password] for Admin and Vendor',
  })
  async loginWithFaceID(
    @Res() res: Response,
    @Body() loginDTO: LoginWithFaceId,
    @LocaleHeader() locale: Locale,
  ) {
    if (loginDTO.role === Roles.ADMIN) {
      throw new HttpException(
        this.i18n.translate(`FACE_ID_NOT_ENABLED`, { lang: locale }),
        HttpStatus.BAD_REQUEST,
      );
    }
    const { accessToken, user } =
      await this.authenticationService.loginWithFaceId(loginDTO, locale);

    res.cookie(env('ACCESS_TOKEN_COOKIE_KEY'), accessToken, cookieConfig);
    return this.responses.success(
      res,
      locale,
      `Logged In Successfully`,

      {
        user,
        accessToken,
      },
    );
  }

  @Post('forget-password')
  @ApiOperation({ summary: 'Forget Password For All users' })
  async forgetPassword(
    @Res() res: Response,
    @Body() forgotPasswordDTO: ForgotPasswordDTO,
    @LocaleHeader() locale: Locale,
  ) {
    const token = await this.authenticationService.forgetPassword(
      forgotPasswordDTO,
      locale,
    );

    return this.responses.success(
      res,
      locale, // this.i18n.translate('response:EMAIL_SUCCESS', locale),
      'Otp Sent Successfully',

      token,
    );
  }
  @Post('reset-password')
  @Auth({ type: SessionType.FORGET_PASSWORD })
  async resetPassword(
    @Res() res: Response,
    @Body() resetPasswordDTO: ResetPasswordDTO,
    @CurrentUser('role') role: Role,
    @CurrentUser('id') id: Id,
    @LocaleHeader() locale: Locale,
  ) {
    await this.authenticationService.resetPassword(role, id, resetPasswordDTO);

    return this.responses.success(res, locale, 'Password Reset Successfully');
  }

  @Post('logout')
  @Auth()
  async logout(
    @Res() res: Response,
    @CurrentUser() { jti }: CurrentUser,
    @LocaleHeader() locale: Locale,
  ) {
    await this.authenticationService.logout(jti);
    return this.responses.success(res, locale, 'User Logged Out');
  }
}
