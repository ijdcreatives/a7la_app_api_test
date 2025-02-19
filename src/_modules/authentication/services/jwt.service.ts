import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Roles, SessionType } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import { jwtConfig } from 'src/configs/jwt.config';
import { PrismaService } from 'src/globals/services/prisma.service';

@Injectable()
export class TokenService {
  constructor(private prisma: PrismaService) {}
  async blockTokens(jti: string) {
    await this.prisma.sessions.deleteMany({ where: { jti } });
  }

  async isTokenBlocked(jti: string) {
    const session = await this.prisma.sessions.findUnique({
      where: { jti },
    });
    return session?.valid || false;
  }

  async isTokenUpdated(jti: string) {
    const session = await this.prisma.sessions.findUnique({
      where: { jti },
    });
    return session?.outdated || false;
  }

  async generateToken(
    userId: Id,
    role: Id,
    baseRole: Roles,
    fcmToken?: string,
    type?: SessionType,
  ) {
    const sessionType = type || SessionType.ACCESS;
    const tokenSecret =
      sessionType === SessionType.FORGET_PASSWORD
        ? env('FORGET_PASSWORD_TOKEN_SECRET')
        : env('ACCESS_TOKEN_SECRET');

    const { jti } = await this.prisma.sessions.create({
      data: {
        Role: { connect: { id: role } },
        fcmToken,
        type: sessionType,
        baseRole,
        User: { connect: { id: userId } },
      },
    });
    return jwt.sign({ jti, id: userId }, tokenSecret, jwtConfig);
  }

  @Cron(CronExpression.EVERY_10_HOURS)
  async deleteExpiredTokens() {
    await this.prisma.sessions.deleteMany({
      where: {
        AND: [
          { type: SessionType.ACCESS },
          {
            OR: [
              { valid: false },
              {
                createdAt: {
                  lte: new Date(Date.now() - +env('ACCESS_TOKEN_EXPIRE_TIME')),
                },
              },
            ],
          },
        ],
      },
    });
  }
  @Cron(CronExpression.EVERY_5_MINUTES)
  async deleteExpiredForgetPasswordTokens() {
    await this.prisma.sessions.deleteMany({
      where: {
        AND: [
          { type: SessionType.FORGET_PASSWORD },
          {
            OR: [
              { valid: false },
              {
                createdAt: {
                  lte: new Date(
                    Date.now() - +env('FORGET_PASSWORD_TOKEN_EXPIRE_TIME'),
                  ),
                },
              },
            ],
          },
        ],
      },
    });
  }
}
