import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/globals/services/prisma.service';
import { PLANS } from './plans';

@Injectable()
export class PlanProvider {
  constructor(private readonly prisma: PrismaService) {}

  async syncPlans() {
    await this.prisma.$transaction(async (prisma) => {
      for (const plan of PLANS) {
        await prisma.plan.upsert({
          where: { id: plan.id },
          update: {
            nameEn: plan.nameEn,
            nameAr: plan.nameAr,
            infoEn: plan.infoEn,
            infoAr: plan.infoAr,
            isActive: true,
          },
          create: {
            nameEn: plan.nameEn,
            nameAr: plan.nameAr,
            infoEn: plan.infoEn,
            infoAr: plan.infoAr,
            isActive: true,
          },
        });
      }
    });
  }
  //
}
