import { Injectable } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';

@Injectable()
export class TransactionHelperService {
  constructor() {}

  async getEarnings(prisma: Prisma.TransactionClient) {
    const earnings = await prisma.order.aggregate({
      _sum: {
        adminCommission: true,
        deliveryCommission: true,
      },
    });

    // Fetch subscribed plans and add their commission to the earnings
    const subscribed = await prisma.subscription.findMany({
      select: { renew: true, Plan: { select: { price: true } } },
    });

    subscribed.forEach((subscription) => {
      earnings._sum.adminCommission +=
        subscription.Plan.price * subscription.renew;
    });

    return earnings._sum;
  }

  async getTransactionStats(prisma: Prisma.TransactionClient, args: any) {
    const result = await prisma.order.groupBy({
      by: ['status'],
      _sum: {
        totalPrice: true,
      },
      where: {
        AND: [
          args.where,
          {
            OR: [
              { status: OrderStatus.DELIVERED },
              { status: OrderStatus.REFUND },
            ],
          },
        ],
      },
    });

    return result;
  }
}
