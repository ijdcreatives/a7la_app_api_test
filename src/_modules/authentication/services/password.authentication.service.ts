import { Injectable } from '@nestjs/common';
import { Roles, RoleType } from '@prisma/client';
import {
  hashPassword,
  validateUserPassword,
} from 'src/globals/helpers/password.helpers';
import { PrismaService } from 'src/globals/services/prisma.service';
import { UserOTPService } from '../_modules/otp/user-otp.service';
import { EmailPasswordLoginDTO } from '../dto/login.dto';
import { userJoinedRole } from '../helpers/role-helper';
import { BaseAuthenticationService } from './base.authentication.service';
import { TokenService } from './jwt.service';

@Injectable()
export class PasswordAuthenticationService {
  constructor(
    private readonly otpService: UserOTPService,
    private readonly tokenService: TokenService,
    private readonly prisma: PrismaService,
    private readonly baseAuthenticationService: BaseAuthenticationService,
  ) {}

  // ----------------------------------------------------------------------------------------------

  async login(credentials: EmailPasswordLoginDTO, role: Roles) {
    const { email, password, fcm } = credentials;
    const model = userJoinedRole(role);
    const Role = await this.prisma.role.findFirst({
      where: { nameEn: role, type: RoleType.SYSTEM },
    });

    const user = await this.prisma[model].findFirst({
      where: { email, deletedAt: null },
      include: { [model]: true },
    });

    this.baseAuthenticationService.userCanLogin(user, model);

    validateUserPassword(password, user[model]['password']);

    if (!Boolean(Number(env('MULTI_SESSION')))) {
      await this.prisma.sessions.deleteMany({
        where: { userId: user.id },
      });
    }

    const accessToken = await this.tokenService.generateToken(
      user.id,
      Role.id,
      role,
      fcm,
    );
    delete user[model]['password'];
    delete user['password'];
    return { user, accessToken };
  }

  async changePassword(userId: Id, password: string, role: Role) {
    const model = userJoinedRole(role.baseRole);
    await this.prisma.user.update({
      where: { id: userId },
      data: { [model]: { password: hashPassword(password) } },
    });
  }

  // ----------------------------------------------------------------------------------------------

  // async verifyRegistrationOTP(emailOrPhone: string, otp: string) {
  //   const user =
  //     await this.baseAuthenticationService.idOrEmailOrPhoneUser(emailOrPhone);

  //   if (!user) throw new UnauthorizedException('invalidOTP');

  //   const isTrue = await this.prisma.$transaction(async (prisma) => {
  //     const isTrue = await this.otpService.verifyOTP(user.id, otp, prisma);

  //     await prisma.user.update({
  //       where: { id: user.id },
  //       data: { status: Status.ACTIVE },
  //     });

  //     return isTrue;
  //   });

  //   return isTrue;
  // }
}
