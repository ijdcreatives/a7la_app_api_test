import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '@prisma/client';
import { PrismaService } from 'src/globals/services/prisma.service';

@Injectable()
export class PermissionAndTypeGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride(
      env('PERMISSION_METADATA_KEY') as string,
      [context.getClass(), context.getHandler()],
    );
    const requiredUserRole = this.reflector.getAllAndOverride<string[]>(
      env('ROLE_METADATA_KEY'),
      [context.getClass(), context.getHandler()],
    );
    const {
      user: { permissions: userPermissions, role: role },
    } = context.switchToHttp().getRequest();

    if (role.baseRole !== Roles.CUSTOMER && role.baseRole !== Roles.DELIVERY) {
      return this.validatePermissions(requiredPermissions, userPermissions);
    }

    if (
      !Array.isArray(requiredUserRole) ||
      !requiredUserRole.includes(role.baseRole)
    ) {
      return false;
    }

    return true;
  }

  validatePermissions(
    requiredPermissions: string[],
    userPermissions: string[],
  ): boolean {
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    for (const requiredPermission of requiredPermissions) {
      if (userPermissions.includes(requiredPermission)) {
        return true;
      }
    }

    return false;
  }
  validateRoles(requiredRoles: Roles[], userRole: Roles): boolean {
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    for (const requiredRole of requiredRoles) {
      if (userRole === requiredRole) {
        return true;
      }
    }

    return false;
  }
}
