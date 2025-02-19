import { UseGuards, applyDecorators } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles, SessionType } from '@prisma/client';

import { PermissionValue } from 'src/_modules/authorization/permissions';
import { PermissionAndTypeGuard } from '../guards/mix-guard';
import { PlanGuard } from '../guards/plan-guard';
import { RoleTypeGuard } from '../guards/roles-guard';
import { WsJwtGuard } from '../guards/ws.guard';
import { RequiredPermissions } from './permission.decorator';
import { RequiredRole } from './role.decorator';

interface AuthOptions {
  type?: SessionType;
  permissions?: PermissionValue[];
  roles?: Roles[];
  except?: Roles[];

  visitor?: boolean;
}

export function Auth({
  type,
  permissions = [],
  roles = [],
  visitor = false,
}: Partial<AuthOptions> = {}) {
  const tokenType = type ? type : SessionType.ACCESS;
  const guards: any[] = visitor
    ? [AuthGuard(SessionType.VISITOR)]
    : [AuthGuard(tokenType)];

  if (permissions.length > 0) {
    guards.push(PermissionAndTypeGuard);
  }

  if (roles.length > 0) {
    guards.push(RoleTypeGuard);
  }
  guards.push(PlanGuard);
  const decorators = [
    RequiredPermissions(...permissions),
    RequiredRole(roles),
    UseGuards(...guards),
    ApiBearerAuth(`${tokenType} Token`),
  ];

  if (visitor) {
    decorators.push(ApiTags('Visitor'));
  }

  if (roles.includes(Roles.ADMIN)) {
    decorators.push(ApiTags('Admin Only'));
  }
  return applyDecorators(...decorators);
}

export function WsAuth() {
  return applyDecorators(UseGuards(WsJwtGuard));
}
