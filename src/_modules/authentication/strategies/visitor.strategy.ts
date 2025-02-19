import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Roles, SessionType, Status } from '@prisma/client';
import { verify } from 'jsonwebtoken';
import { Strategy } from 'passport-custom';
import { PrismaService } from 'src/globals/services/prisma.service';
import { extractJWT } from '../helpers/extract-token';

@Injectable()
export class VisitorStrategy extends PassportStrategy(Strategy, 'VISITOR') {
  constructor(private prisma: PrismaService) {
    super();
  }

  async validate(request: any) {
    const token = extractJWT(request);
    let payload = null;

    if (token) {
      try {
        payload = verify(token, env('ACCESS_TOKEN_SECRET'));
      } catch (error) {
        catchHandler(error.message);
      }
    }
    if (!payload) {
      const serializedUser = {
        id: null,
        jti: null,
        role: {
          id: 2,
          name: 'Customer',
          baseRole: Roles.CUSTOMER,
        },
        permissions: [],
      };
      return serializedUser; // Passport attaches this to `req.user`
    }

    const { id, jti } = payload;
    if (!id || !jti) {
      const serializedUser = {
        id: null,
        jti: null,
        role: {
          id: 2,
          name: 'Customer',
          baseRole: Roles.CUSTOMER,
        },
        permissions: [],
      };
      return serializedUser;
    }
    const userExist = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        sessions: {
          where: { jti, type: SessionType.ACCESS },
          include: { Role: { include: { RolePermission: true } } },
        },
        Vendor: { include: { Role: { include: { RolePermission: true } } } },
        Customer: true,
      },
    });

    if (userExist && userExist.sessions.length) {
      if (userExist.Customer && userExist.Customer.status !== Status.ACTIVE)
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
        permissions: userExist.sessions[0].Role.RolePermission?.map(
          (p) => p.permission,
        ),
      };
      return serializedUser;
    }
    const serializedUser = {
      id: null,
      jti: null,
      role: {
        id: 2,
        name: 'Customer',
        baseRole: Roles.CUSTOMER,
      },
      permissions: [],
    };
    return serializedUser;
  }
}
