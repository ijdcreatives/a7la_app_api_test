import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/globals/services/prisma.service';
import { FilterOrderReportDTO } from './dto/order-report.dto';
import {
  getArgs,
  orderReportSelectArgs,
} from './prisma-args/order-report.prisma.args';

@Injectable()
export class OrderReportService {
  constructor(private readonly prisma: PrismaService) {}

  async getCards(filters: FilterOrderReportDTO) {
    const args = getArgs(filters);
    const totalOrders = await this.prisma.order.count({ ...args });
    const totalOrderAmount = await this.prisma.order
      .groupBy({
        where: args.where,
        by: ['status'],
        _sum: { price: true },
      })
      ?.then((res) => res.map((item) => ({ [item.status]: item._sum.price })));

    const orderStatistics = await this.prisma.order
      .groupBy({
        where: args.where,
        by: ['status'],
        _count: { _all: true },
      })
      ?.then((res) => res.map((item) => ({ [item.status]: item._count._all })));

    const { groupedByYear: yearOrderChart } =
      await this.getYearlyChart(filters);

    const orders = await this.getOrderReport(filters);
    return {
      totalOrderAmount,
      totalOrders,
      yearOrderChart,
      orderStatistics,
      table: orders,
    };
  }

  async getYearlyChart(filters: FilterOrderReportDTO) {
    const args = getArgs(filters);
    const orders = await this.prisma.order.findMany({
      where: args.where,
      select: {
        createdAt: true,
        paymentMethod: true,
        price: true,
      },
    });

    const orderStatistics = this.getOrderStatistics(orders);

    const groupedByYear = orders.reduce((acc, order) => {
      const year = new Date(order.createdAt).getFullYear();
      if (!acc[year]) {
        acc[year] = 0;
      }
      acc[year] += order.price;
      return acc;
    }, {});

    return { groupedByYear, orderStatistics };
  }

  getOrderStatistics(orders: any) {
    const groupedByPaymentMethod = orders.reduce((acc, order) => {
      const paymentMethod = order.paymentMethod;
      if (!acc[paymentMethod]) {
        acc[paymentMethod] = 0;
      }
      acc[paymentMethod] += order.price;
      return acc;
    }, {});

    return groupedByPaymentMethod;
  }

  async getOrderReport(filters: FilterOrderReportDTO) {
    const args = getArgs(filters);
    const selectArgs = orderReportSelectArgs();
    const orders = await this.prisma.order.findMany({ ...args, ...selectArgs });
    return orders;
  }
}
