import { Injectable } from '@nestjs/common';
import { Roles, RoleType } from '@prisma/client';
import { PrismaService } from 'src/globals/services/prisma.service';
import { GuestOTPService } from '../_modules/otp/guest-otp.service';
import { PhoneOTPLoginDTO } from '../dto/login.dto';
import { userJoinedRole } from '../helpers/role-helper';
import { BaseAuthenticationService } from './base.authentication.service';
import { TokenService } from './jwt.service';

@Injectable()
export class OTPAuthenticationService {
  constructor(
    private readonly otpService: GuestOTPService,
    private readonly tokenService: TokenService,
    private readonly prisma: PrismaService,
    private readonly baseAuthenticationService: BaseAuthenticationService,
  ) {}

  // ----------------------------------------------------------------------------------------------

  async requestLoginOTP(phone: string, role: Roles, locale: Locale) {
    const user = await this.getUser(role, phone);
    await this.otpService.generateOTP(phone, user.id, role, locale);
  }

  // ----------------------------------------------------------------------------------------------

  // ----------------------------------------------------------------------------------------------

  // async verifyRegistrationOTP(phone: string, otp: string) {
  //   return await this.otpService.verifyNewPhoneAndReturnToken(phone, otp);
  // }

  // ----------------------------------------------------------------------------------------------

  private async getUser(role: Roles, phone: string) {
    const model = userJoinedRole(role);

    let user = await this.prisma[model].findFirst({
      where: { phone, deletedAt: null },
    });

    return user;
  }
}
