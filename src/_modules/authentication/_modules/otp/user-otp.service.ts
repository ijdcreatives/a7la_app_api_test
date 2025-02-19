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
export class UserOTPService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly smsService: SMSService,
    private readonly i18n: I18nService,
  ) {}

  async generateOTP(
    phone: string,
    userId: Id,
    role: Roles,
    prisma: PrismaService | PrismaTransaction = this.prisma,
    locale: Locale,
  ) {
    const otp = env('DEFAULT_OTP')
      ? env('DEFAULT_OTP')
      : generateRandomNumberString();
    const otpIsExist = await prisma.oTP.findUnique({
      where: { userId_role: { userId, role } },
      select: { createdAt: true, generatedTimes: true },
    });
    const dbOtp = await prisma.oTP.upsert({
      where: { userId_role: { userId, role } },
      update: {
        otp,
        token: null,
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

  async verifyOTP(
    userId: Id,
    otp: string,
    prisma: PrismaService | PrismaTransaction = this.prisma,
    locale: Locale,
  ) {
    const existingOtp = await prisma.oTP.findFirst({
      where: { userId },
    });

    if (!existingOtp)
      throw new UnauthorizedException(
        this.i18n.translate(`INVALID_OTP`, { lang: locale }),
      );

    if (existingOtp.otp !== otp)
      throw new UnauthorizedException(
        this.i18n.translate(`INVALID_OTP`, { lang: locale }),
      );

    await prisma.oTP.delete({
      where: { id: existingOtp.id },
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
