import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { SessionType, Status } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/globals/services/prisma.service';
import { extractJWT } from '../helpers/extract-token';

export type Payload = {
  exp: number;
  iat: number;
} & CurrentUser;

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'ACCESS') {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([extractJWT]),
      secretOrKey: env('ACCESS_TOKEN_SECRET'),
      jsonWebTokenOptions: {
        maxAge: +env('ACCESS_TOKEN_EXPIRE_TIME'),
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
          where: { jti, type: SessionType.ACCESS },
          include: { Role: { include: { RolePermission: true } } },
        },
        Vendor: {
          include: {
            Store: { select: { mainStoreId: true, status: true } },
            Role: { include: { RolePermission: true } },
          },
        },
        Customer: true,
      },
    });
    if (userExist && userExist.sessions.length) {
      if (userExist.Customer && userExist.Customer.status !== Status.ACTIVE)
        return false;
      if (userExist.Vendor && userExist.Vendor.Store.status !== Status.ACTIVE)
        return false;
      if (!userExist.sessions[0]?.valid) return false;
      const baseRole = userExist.sessions[0].baseRole;

      const serializedUser = {
        id: userExist.id,
        jti,
        role: {
          id: userExist.sessions[0].Role.id,
          name: userExist.sessions[0].Role.nameEn,
          baseRole: baseRole,
        },
        storeId: baseRole === 'VENDOR' ? userExist.Vendor?.storeId : null,
        mainStoreId:
          baseRole === 'VENDOR' && userExist.Vendor?.Store.mainStoreId
            ? userExist.Vendor?.Store.mainStoreId
            : null,

        permissions: userExist.sessions[0].Role.RolePermission?.map(
          (p) => p.permission,
        ),
      };
      return serializedUser;
    }

    return false;
  }
}
