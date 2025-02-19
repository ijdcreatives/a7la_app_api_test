import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '@prisma/client';
import { PrismaService } from 'src/globals/services/prisma.service';

@Injectable()
export class PlanGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (
      (request.path.includes('review') || request.path.includes('chat')) &&
      user.role.baseRole === Roles.VENDOR
    ) {
      const plan = await this.prisma.store.findUnique({
        where: { id: user.storeId },
        select: { Plan: true },
      });
      if (!plan.Plan.chat && request.path.includes('chat')) return false;
      if (!plan.Plan.review && request.path.includes('review')) return false;
      if (!plan.Plan.pos && request.path.includes('pos')) return false;
    }
    return true;
  }
}
