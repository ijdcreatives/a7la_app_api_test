import { BadRequestException, Injectable } from '@nestjs/common';
import {
  LoyaltyPoint,
  LoyaltyPointType,
  OrderStatus,
  Transaction,
  TransactionType,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { firstOrMany } from 'src/globals/helpers/first-or-many';
import { localizedObject } from 'src/globals/helpers/localized.return';
import { PrismaService } from 'src/globals/services/prisma.service';
import { SettingService } from 'src/globals/services/settings.service';
import {
  convertPoints,
  CreateLoyaltyPointDTO,
  FilterLoyaltyPointDTO,
} from '../dto/loyaltyPoint.dto';
import {
  CreateTransactionDTO,
  FilterTransactionDTO,
  FilterTransactionReportDTO,
} from '../dto/transaction.dto';
import {
  getReportArgs,
  getTransactionArgs,
  getTransactionReportArgsWithSelect,
} from '../prisma-args/transaction.prisma.args';
import { TransactionHelperService } from './transaction.helper.service';

@Injectable()
export class TransactionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helper: TransactionHelperService,
    private readonly settingService: SettingService,
  ) {}

  async createTransaction(data: CreateTransactionDTO) {
    await this.prisma.$transaction(async (prisma) => {
      const lastTransaction = await prisma.transaction.findFirst({
        where: { customerId: data.customerId },
        select: { balance: true },
        orderBy: { createdAt: 'desc' },
        take: 1,
      });

      const lastBalance = lastTransaction?.balance || 0.0;
      data.balance = +lastBalance + +data.credit - +data.debit;

      await prisma.transaction.create({ data });
    });
  }

  async createLoyaltyPoint(data: CreateLoyaltyPointDTO) {
    await this.prisma.loyaltyPoint.create({
      data: data,
    });
  }

  async findAll(
    locale: Locale,
    filters: FilterTransactionDTO,
  ): Promise<Transaction[]> {
    const args = getTransactionArgs(filters);
    const data = await this.prisma.transaction[firstOrMany(filters?.id)]({
      ...args,
    });

    return localizedObject(data, locale) as Transaction[];
  }

  async findReport(locale: Locale, filters: FilterTransactionReportDTO) {
    const args = getTransactionReportArgsWithSelect();
    const whereArgs = getReportArgs(filters);
    const data = await this.prisma.order.findMany({
      ...whereArgs,
      ...args,
    });

    return localizedObject(data, locale);
  }

  async findTotalReportTransactions(filters: FilterTransactionReportDTO) {
    const total = await this.prisma.order.count({
      ...getReportArgs(filters),
    });
    return total;
  }

  async findStatistic(filters: FilterTransactionDTO) {
    const args = getTransactionArgs(filters);
    const AllStatistic = await this.prisma.transaction.aggregate({
      _sum: {
        credit: true,
        debit: true,
      },
      where: args.where,
    });
    const statistics = await Promise.all(
      Object.values(TransactionType).map(async (type) => {
        const result = await this.prisma.transaction.aggregate({
          _sum: {
            credit: true,
          },
          where: {
            ...args.where,
            type,
          },
        });

        return {
          type,
          totalCredit: result._sum.credit || 0,
        };
      }),
    );
    return {
      FundStatistics: statistics,
      AllStatistic,
    };
  }

  async findLoyaltyPoint(
    filters: FilterLoyaltyPointDTO,
  ): Promise<LoyaltyPoint[]> {
    const args = getTransactionArgs(filters);
    const data = await this.prisma.loyaltyPoint[firstOrMany(filters?.id)]({
      ...args,
    });

    return data as LoyaltyPoint[];
  }

  async findLoyaltyPointStatistic(filters: FilterTransactionDTO) {
    const args = getTransactionArgs(filters);
    const AllStatistic = await this.prisma.loyaltyPoint.aggregate({
      _sum: {
        earned: true,
        converted: true,
        current: true,
      },
      where: args.where,
    });
    const statistics = await Promise.all(
      Object.values(LoyaltyPointType).map(async (type) => {
        const result = await this.prisma.loyaltyPoint.aggregate({
          _sum: {
            earned: true,
            converted: true,
            current: true,
          },
          where: {
            ...args.where,
            type,
          },
        });

        return {
          type,
          totalEarned: result._sum.earned || 0,
          totalConverted: result._sum.converted || 0,
          totalCurrent: result._sum.current || 0,
        };
      }),
    );
    return {
      LoyaltyPointTypesStatistics: statistics,
      AllStatistic,
    };
  }

  async findTotalTransactions(filters: FilterTransactionDTO): Promise<number> {
    const args = getTransactionArgs(filters);

    const total = await this.prisma.transaction.count({ ...args });
    return total;
  }

  async findTotalLoyaltyPoint(filters: FilterLoyaltyPointDTO): Promise<number> {
    const args = getTransactionArgs(filters);

    const total = await this.prisma.loyaltyPoint.count({ ...args });
    return total;
  }

  async convertPoints(body: convertPoints, customerId: Id) {
    const { customerLoyaltyPoints } = await this.settingService.getSettings([
      'customerLoyaltyPoints',
    ]);
    if (body.points > customerLoyaltyPoints) {
      throw new BadRequestException(
        "You don't convert all this points in one operation",
      );
    }
    const user = await this.prisma.user.findUnique({
      where: {
        id: customerId,
      },
      select: {
        Customer: {
          select: {
            earningPoints: true,
            wallet: true,
          },
        },
      },
    });
    if (+body.points > +user.Customer.earningPoints) {
      throw new BadRequestException("You don't have enough points");
    }
    await this.prisma.customer.update({
      where: {
        id: customerId,
      },
      data: {
        earningPoints: +(+user.Customer.earningPoints - +body.points),
        wallet: +(+user.Customer.wallet + +body.points),
      },
    });
    await this.createTransactionAndLoyaltyPoint(body, customerId, user);
  }

  async increasePoint(customerId: Id, price: Decimal) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: customerId,
      },
      select: {
        Customer: {
          select: {
            earningPoints: true,
          },
        },
      },
    });
    const { customerOrderPoints } = await this.settingService.getSettings([
      'customerLoyaltyPoints',
    ]);

    const LoyaltyData: CreateLoyaltyPointDTO = {
      customerId,
      earned: new Decimal(0),
      converted: new Decimal(0),
      current: new Decimal(+user.Customer.earningPoints + +customerOrderPoints),
      type: LoyaltyPointType.OrderPlace,
    };
    const TransactionData: CreateTransactionDTO = {
      customerId,
      credit: new Decimal(+price),
      debit: new Decimal(0),
      type: TransactionType.PAYMENT,
    };

    await this.prisma.$transaction(async (tx) => {
      await this.createLoyaltyPoint(LoyaltyData);
      await this.createTransaction(TransactionData);
      await tx.customer.update({
        where: { id: customerId },
        data: {
          earningPoints: +(+user.Customer.earningPoints + +customerOrderPoints),
        },
      });
    });
  }

  private async createTransactionAndLoyaltyPoint(
    body: convertPoints,
    customerId: Id,
    user: any,
  ) {
    const { customerOrderPoints } = await this.settingService.getSettings([
      'customerOrderPoints',
    ]);

    const LoyaltyData: CreateLoyaltyPointDTO = {
      customerId,
      earned: new Decimal(0),
      converted: new Decimal(+body.points),
      current: new Decimal(+user.Customer.earningPoints - +body.points),
      type: LoyaltyPointType.LoyaltyPoint,
    };
    const TransactionData: CreateTransactionDTO = {
      customerId,
      credit: new Decimal(0),
      debit: new Decimal(+body.points * +customerOrderPoints),
      type: TransactionType.LOYALTY_POINT,
    };
    await this.prisma.$transaction(async (tx) => {
      await this.createLoyaltyPoint(LoyaltyData);
      await this.createTransaction(TransactionData);
      await tx.customer.update({
        where: { id: customerId },
        data: {
          earningPoints: +(+user.Customer.earningPoints - +body.points),
        },
      });
    });
  }

  async findReportStatistics(filters: FilterTransactionReportDTO) {
    const args = getReportArgs(filters);
    const [result, earning] = await Promise.all([
      this.helper.getTransactionStats(this.prisma, args),
      this.helper.getEarnings(this.prisma),
    ]);

    result.push(
      {
        _sum: { totalPrice: earning.adminCommission },
        status: 'adminCommission' as OrderStatus,
      },
      {
        _sum: { totalPrice: earning.deliveryCommission },
        status: 'deliveryCommission' as OrderStatus,
      },
    );

    return result;
  }
}
