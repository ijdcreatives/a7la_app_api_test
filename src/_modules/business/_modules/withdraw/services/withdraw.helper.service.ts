import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, WithdrawStatus } from '@prisma/client';

@Injectable()
export class WithdrawHelperService {
  async canWithdraw(
    prisma: Prisma.TransactionClient,
    requestAmount: number,
    storeId?: Id,
    deliveryManId?: Id,
  ) {
    const store = await prisma.wallet.findUnique({
      where: {
        storeId,
        deliveryManId,
      },
    });
    if (+store.currentBalance < requestAmount)
      throw new BadRequestException('not_enough_balance');
  }

  async increaseBalance(
    prisma: Prisma.TransactionClient,
    amount: number,
    storeId?: Id,
    deliveryManId?: Id,
  ) {
    await prisma.wallet.updateMany({
      where: {
        OR: [{ storeId }, { deliveryManId }],
      },
      data: {
        pendingWithdraw: {
          decrement: amount,
        },
        currentBalance: {
          increment: amount,
        },
      },
    });
  }
  async decreaseBalance(
    prisma: Prisma.TransactionClient,
    amount: number,
    storeId?: Id,
    deliveryManId?: Id,
  ) {
    await prisma.wallet.updateMany({
      where: {
        OR: [{ storeId }, { deliveryManId }],
      },
      data: {
        pendingWithdraw: {
          increment: amount,
        },
        currentBalance: {
          decrement: amount,
        },
      },
    });
  }
  async IncreaseOrDecreaseCurrentBalance(
    prisma: Prisma.TransactionClient,
    amount: number,
    status: WithdrawStatus,
    storeId?: Id,
    deliveryManId?: Id,
  ) {
    if (status !== WithdrawStatus.APPROVED)
      await this.increaseBalance(prisma, amount, storeId, deliveryManId);
    else await this.decreaseBalance(prisma, amount, storeId, deliveryManId);
  }
}
