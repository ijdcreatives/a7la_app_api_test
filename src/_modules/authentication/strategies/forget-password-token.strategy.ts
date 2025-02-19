import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { SessionType } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/globals/services/prisma.service';
import { extractJWT } from '../helpers/extract-token';

export type Payload = {
  exp: number;
  iat: number;
} & CurrentUser;

@Injectable()
export class ForgetPasswordTokenStrategy extends PassportStrategy(
  Strategy,
  'FORGET_PASSWORD',
) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([extractJWT]),
      secretOrKey: env('FORGET_PASSWORD_TOKEN_SECRET'),
      jsonWebTokenOptions: {
        maxAge: +env('FORGET_PASSWORD_TOKEN_EXPIRE_TIME'),
      },
    });
  }

  async validate(payload: Payload) {
    const { id, jti } = payload;
    if (!id || !jti) return false;

    const userExist = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        sessions: {
          where: { jti, type: SessionType.FORGET_PASSWORD },
          include: { Role: { include: { RolePermission: true } } },
        },
      },
    });

    if (userExist && userExist.sessions.length) {
      if (!userExist.sessions[0]?.valid) return false;
      const baseRole = userExist.sessions[0].baseRole;
      const serializedUser = {
        id: userExist.id,
        jti,
        role: {
          id: userExist.sessions[0].Role.id,
          name: userExist.sessions[0].Role.nameEn,
          baseRole,
        },
      };
      return serializedUser;
    }

    return false;
  }
}
