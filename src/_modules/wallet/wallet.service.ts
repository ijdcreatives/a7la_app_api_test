import { Injectable } from '@nestjs/common';
import { TransactionType } from '@prisma/client';
import { FilterTransactionDTO } from 'src/_modules/transaction/dto/transaction.dto';
import { getTransactionArgs } from 'src/_modules/transaction/prisma-args/transaction.prisma.args';
import { countArgs } from 'src/globals/helpers/count.args';
import { PrismaService } from 'src/globals/services/prisma.service';
import { AddFundDTO } from './dto/add-fund.dto';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  async addFund(body: AddFundDTO) {
    await this.prisma.$transaction(async (prisma) => {
      const lastTransaction = await prisma.transaction.findFirst({
        where: { customerId: body.customerId },
        select: { balance: true },
        orderBy: { createdAt: 'desc' },
      });

      const lastBalance = lastTransaction?.balance || 0.0;

      await prisma.transaction.create({
        data: {
          type: TransactionType.FUND,
          balance: +lastBalance + +body.amount,
          credit: +body.amount,
          customerId: body.customerId,
          reference: body.reference,
        },
      });

      await prisma.customer.update({
        data: { wallet: { increment: body.amount } },
        where: { id: body.customerId },
      });
    });
  }

  async statistics(filters: FilterTransactionDTO) {
    const args = getTransactionArgs(filters);

    const some = await this.prisma.transaction.aggregate({
      ...args,
      _sum: { debit: true, credit: true },
    });

    const statistics = await this.prisma.transaction.groupBy({
      by: ['type'],
      _sum: { credit: true },
      where: args.where,
    });

    // !!!!! Chart is for credit types only
    return {
      ...some._sum,
      chart: statistics?.map((type) => ({
        type: type.type,
        totalCredit: type._sum.credit,
      })),
    };
  }

  async getReport(filters: FilterTransactionDTO) {
    const args = getTransactionArgs(filters);
    const data = await this.prisma.transaction.findMany({
      ...args,
      include: {
        Customer: {
          select: {
            User: { select: { id: true, name: true } },
          },
        },
      },
    });
    const total = await this.prisma.transaction.count(countArgs(args));

    return { data, total };
  }

  async findWallet(storeId: Id) {
    const data = await this.prisma.wallet.findUnique({
      where: {
        storeId,
      },
    });
    return data;
  }
}
