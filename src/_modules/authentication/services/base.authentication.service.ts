import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  DeliveryManStatus,
  Prisma,
  Roles,
  RoleType,
  SessionType,
  Status,
  StoreStatus,
  User,
} from '@prisma/client';
import { I18nService } from 'nestjs-i18n';
import { UserService } from 'src/_modules/user/user.service';
import { localizedObject } from 'src/globals/helpers/localized.return';
import {
  hashPassword,
  validateUserPassword,
} from 'src/globals/helpers/password.helpers';
import { MailService } from 'src/globals/services/email.service';
import { PrismaService } from 'src/globals/services/prisma.service';
import { GuestOTPService } from '../_modules/otp/guest-otp.service';
import { EnableFaceIdDTO } from '../dto/face-id.dto';
import { ForgotPasswordDTO } from '../dto/forgot-password.dto';
import { LoginWithFaceId } from '../dto/login-faceId.dto';
import { LoginDto } from '../dto/login.dto';
import { ResetPasswordDTO } from '../dto/reset-password.dto';
import { userJoinedRole } from '../helpers/role-helper';
import { CreateDelivery } from '../types/createDelivery.type';
import { CreateUser } from '../types/createVendor.type';
import { TokenService } from './jwt.service';
import { PhoneVerifyDTO } from 'src/_modules/user/_roles/deliveryman/dto/delivery.dto';

@Injectable()
export class BaseAuthenticationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly emailService: MailService,
    private readonly userService: UserService,
    private readonly otpService: GuestOTPService,
    private readonly i18n: I18nService,
    private readonly guestOTPService: GuestOTPService,
  ) {}

  async enableFaceId(
    currentUser: CurrentUser,
    body: EnableFaceIdDTO,
    role: Role,
  ) {
    const model = userJoinedRole(role.baseRole);
    await this.prisma[model].update({
      where: { id: currentUser.id },
      data: { deviceId: body.deviceId },
    });
  }

  async verify(body: PhoneVerifyDTO, locale: Locale) {
    const { id, phone, otp, role } = body;

    await this.guestOTPService.verifyNewPhoneAndReturnToken(phone, otp, locale);
    const model = userJoinedRole(role);
    const user = await this.prisma[model].findUnique({ where: { id } });
    await this.prisma[model].update({
      where: { id },
      data: {
        status: role === Roles.CUSTOMER ? Status.ACTIVE : Status.PENDING,
      },
    });
    return { message: 'Store is activated' };
  }

  async loginWithFaceId(credentials: LoginWithFaceId, locale: Locale) {
    const model = userJoinedRole(credentials.role as Roles);
    const user = await this.prisma[model].findUnique({
      where: {
        deviceId: credentials.deviceId,
      },
      select: {
        id: true,
        role: true,
        phone: true,
      },
    });
    if (!user)
      throw new NotFoundException(
        this.i18n.t('FACE_ID_NOT_FOUND', {
          args: {
            name: 'Face',
          },
          lang: locale,
        }),
      );

    if (!Boolean(Number(env('MULTI_SESSION')))) {
      await this.prisma.sessions.deleteMany({
        where: { userId: user.id },
      });
    }
    const accessToken = await this.tokenService.generateToken(
      user.id,
      user.role,
      credentials.role,
      undefined,
    );

    const userData = await this.userService.getProfile(
      user.id,
      credentials.role,
      locale,
    );
    delete userData.role;
    return { user: userData, accessToken };
  }

  async forgetPassword(forgotPasswordDTO: ForgotPasswordDTO, locale: Locale) {
    const { email, phone } = forgotPasswordDTO;
    const model = userJoinedRole(forgotPasswordDTO.role);
    const user = await this.prisma[model].findFirst({
      where: {
        OR: [{ email }, { phone }],
        deletedAt: null,
      },
    });
    if (!user)
      throw new BadRequestException(
        this.i18n.t('NOT_FOUND', {
          lang: locale,
          args: { user: locale === 'ar' ? 'المستخدم' : 'User' },
        }),
      );

    const token = await this.tokenService.generateToken(
      user.id,
      user['role'],
      forgotPasswordDTO.role,
      undefined,
      SessionType.FORGET_PASSWORD,
    );

    if (email) {
      const link = `${env('FRONTEND_URL')}/reset-password?token=${token}`;
      await this.emailService.sendForgetEmail(
        { name: user.firstName + ' ' + user.lastName, email: user.email },
        link,
      );
    } else if (phone) {
      await this.otpService.generateNewNumberOTP(
        user.phone,
        forgotPasswordDTO.role,
      );
    }
    return token;
  }

  async resetPassword(role: Role, id: Id, resetPasswordDTO: ResetPasswordDTO) {
    const { password } = resetPasswordDTO;
    const model = userJoinedRole(role.baseRole);

    await this.prisma[model].update({
      where: { id },
      data: { password: hashPassword(password) },
    });
  }

  // ----------------------------------------------------------------------------------------------

  async logout(jti: string) {
    await this.prisma.sessions.delete({ where: { jti } });
  }

  // ----------------------------------------------------------------------------------------------

  // ----------------------------------------------------------------------------------------------

  userCanLogin(user: any, model: string) {
    if (!user) {
      throw new UnprocessableEntityException(
        this.i18n.translate('INVALID_CREDENTIALS', { lang: 'en' }),
      );
    }

    if (user.disabled == true) {
      throw new UnprocessableEntityException(
        this.i18n.translate('DISABLED_ACCOUNT', { lang: 'en' }),
      );
    }
  }

  // ----------------------------------------------------------------------------------------------
  async UserExist(data: CreateUser, model: string) {
    const user = await this.prisma[model].findFirst({
      where: {
        OR: [{ email: data.email }, { phone: data.phone }],
        deletedAt: null,
      },
    });

    return user;
  }
  // ----------------------------------------------------------------------------------------------
  async initUser(data: CreateUser): Promise<User> {
    const user = await this.prisma.user.create({
      data: { ...data },
    });
    return user;
  }
  // ----------------------------------------------------------------------------------------------
}
