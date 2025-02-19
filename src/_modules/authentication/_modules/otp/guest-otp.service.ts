import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Roles } from '@prisma/client';
import { I18nService } from 'nestjs-i18n';
import { generateRandomNumberString } from 'src/globals/helpers/generate-random-numbers';
import { PrismaService } from 'src/globals/services/prisma.service';
import { SMSService } from 'src/globals/services/sms.service';

@Injectable()
export class GuestOTPService {
  constructor(
    private prisma: PrismaService,
    private readonly smsService: SMSService,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Generates a One-Time Password (OTP) for a given user.
   * -------------------------------------------------------
   * This function does the following:
   * 1. Generates an OTP (either default or random).
   * 2. Checks if an OTP already exists for the user.
   * 3. Creates or updates the OTP in the database.
   * 4. If not using a default OTP:
   *    - Checks if the OTP has been generated too many times.
   *    - Sends the OTP via SMS.
   * 5. Returns the generated OTP.
   */
  async generateOTP(phone: string, userId: Id, role: Roles, locale: Locale) {
    const otp = env('DEFAULT_OTP')
      ? env('DEFAULT_OTP')
      : generateRandomNumberString();

    const otpIsExist = await this.prisma.oTP.findUnique({
      where: { userId_role: { userId, role } },
      select: { createdAt: true, generatedTimes: true },
    });

    const dbOtp = await this.prisma.oTP.upsert({
      where: { userId_role: { userId, role } },
      update: {
        otp,
        generatedTimes: { increment: 1 },
        createdAt: otpIsExist?.generatedTimes <= 3 ? new Date() : undefined,
      },
      create: { userId, role, otp },
    });

    if (!env('DEFAULT_OTP')) {
      if (dbOtp.generatedTimes > 2)
        throw new BadRequestException(
          this.i18n.translate(`TOO_MANY_REQUESTS`, { lang: locale }),
        );
      await this.smsService.sendSMS(phone, `Your OTP is ${otp}`);
    }
    return otp;
  }

  /**
   * Verifies the OTP and returns a token if valid.
   * -------------------------------------------------------
   * This function does the following:
   * 1. Checks if a user exists with the given phone number.
   * 2. Verifies if a valid OTP exists for the user:
   *    - Matches the provided OTP
   *    - Belongs to the user with the given phone
   *    - Has been generated 3 or fewer times
   *    - Is not expired (based on OTP_INVALIDATE_TIME)
   * 3. If OTP is invalid, throws an UnauthorizedException.
   * 4. Generates a new token.
   * 5. Checks if the OTP has already been used.
   * 6. Updates the OTP record with the new token.
   * 7. Returns the generated token.
   *
   * @param phone - The phone number of the user
   * @param otp - The OTP to verify
   * @returns A new token if OTP is valid
   * @throws UnauthorizedException if OTP is invalid or already used
   */
  // async verifyOTPAndReturnToken(phone: string, otp: string) {
  //   await this.prisma.oTP.findFirst({
  //     where: { User: { phone } },
  //   });
  //   const otpExist = await this.prisma.oTP.findFirst({
  //     where: {
  //       otp,
  //       User: { phone },
  //       generatedTimes: { lte: 3 },
  //       createdAt: { gte: new Date(Date.now() - +env('OTP_INVALIDATE_TIME')) },
  //     },
  //   });
  //   if (!otpExist) throw new UnauthorizedException('Invalid OTP');
  //   const token = generateRandomNumberString();
  //   if (otpExist.token) throw new UnauthorizedException('OTP already used');
  //   await this.prisma.oTP.update({
  //     where: { id: otpExist.id },
  //     data: { token },
  //   });
  //   return token;
  // }

  // async verifyOTPToken(phone: string, token: string) {
  //   const tokenExist = await this.prisma.oTP.findFirst({
  //     where: { token, User: { phone } },
  //   });
  //   if (!tokenExist) throw new UnauthorizedException('Invalid Token');
  //   await this.prisma.oTP.delete({
  //     where: { id: tokenExist.id },
  //   });
  //   return tokenExist;
  // }

  async generateNewNumberOTP(phone: string, role: Roles) {
    const otp = env('DEFAULT_OTP')
      ? env('DEFAULT_OTP')
      : generateRandomNumberString();
    const otpIsExist = await this.prisma.registerOTP.findUnique({
      where: { phone_role: { phone, role } },
      select: { createdAt: true, generatedTimes: true },
    });
    const dbOtp = await this.prisma.registerOTP.upsert({
      where: { phone_role: { phone, role } },
      update: {
        otp,
        generatedTimes: { increment: 1 },
        createdAt:
          otpIsExist?.generatedTimes <= 3 || env('DEFAULT_OTP')
            ? new Date()
            : undefined,
      },
      create: { phone, role, otp },
    });
    if (!env('DEFAULT_OTP')) {
      if (dbOtp.generatedTimes > 2) throw new BadRequestException('TOO_MANY');
      await this.smsService.sendSMS(phone, `Your OTP is ${otp}`);
    }
    return otp;
  }

  async verifyNewPhoneAndReturnToken(
    phone: string,
    otp: string,
    locale: Locale,
  ) {
    const otpExist = await this.prisma.registerOTP.findFirst({
      where: {
        otp,
        phone,
        createdAt: { gte: new Date(Date.now() - +env('OTP_INVALIDATE_TIME')) },
      },
    });
    if (!otpExist)
      throw new UnauthorizedException(
        this.i18n.translate(`INVALID_OTP`, { lang: locale }),
      );
    await this.prisma.registerOTP.deleteMany({
      where: { phone },
    });
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleCron() {
    await this.prisma.oTP.deleteMany({
      where: {
        createdAt: {
          lte: new Date(Date.now() - +env('OTP_IGNORE_TIME')),
        },
      },
    });
  }
}
