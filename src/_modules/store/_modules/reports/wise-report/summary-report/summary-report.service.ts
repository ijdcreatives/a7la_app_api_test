import { Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { localizedObject } from 'src/globals/helpers/localized.return';
import { PrismaService } from 'src/globals/services/prisma.service';
import { FilterSummaryReportDTO } from './dto/summary-report.dto';
import {
  getSummaryProductReportArgs,
  selectSummaryReportArgs,
} from './prisma-args/summary-report.prisma.args';

@Injectable()
export class SummaryReportService {
  constructor(private readonly prisma: PrismaService) {}

  async getCards(filters: FilterSummaryReportDTO, locale) {
    const args = getSummaryProductReportArgs(filters);
    const registeredStores = await this.prisma.store.count({
      ...args,
    });
    const date = new Date();
    const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
    const newItems = await this.prisma.product.count({
      where: {
        ...args.where,
        createdAt: { gte: lastMonth },
      },
    });

    const { groupedByYear: yearOrderChart, completedPayment } =
      await this.getYearlyChart(filters);
    const totalOrders = await this.prisma.order
      .groupBy({
        where: args.where,
        by: ['status'],
        _count: { _all: true },
      })
      ?.then((res) => res.map((item) => ({ [item.status]: item._count._all })));

    const products = await this.getSummaryReport(filters, locale);

    return {
      table: products,
      registeredStores,
      locale,
      newItems,
      totalOrders,
      yearOrderChart,
      completedPayment,
    };
  }

  async getYearlyChart(filters: FilterSummaryReportDTO) {
    const args = getSummaryProductReportArgs(filters);

    const orders = await this.prisma.order.findMany({
      where: args.where,
      //   where: { status: OrderStatus.DELIVERED, ...filters },
      select: {
        createdAt: true,
        paymentMethod: true,
        price: true,
      },
    });

    const completedPayment = this.getCompletedPayment(orders);

    const groupedByYear = orders.reduce((acc, order) => {
      const year = new Date(order.createdAt).getFullYear();
      if (!acc[year]) {
        acc[year] = 0;
      }
      acc[year] += order.price;
      return acc;
    }, {});

    return { groupedByYear, completedPayment };
  }

  getCompletedPayment(orders: any) {
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

  async getSummaryReport(filters: FilterSummaryReportDTO, locale: Locale) {
    const args = getSummaryProductReportArgs(filters);
    const selectProductArgs = selectSummaryReportArgs();
    const stores = await this.prisma.store.findMany({
      ...args,
      ...selectProductArgs,
    });
    const data = [];
    for (let i = 0; i < stores?.length; i++) {
      const totalOrders = await this.prisma.order.count({
        where: { storeId: stores[i].id },
      });
      const totalDeliveredOrders = await this.prisma.order.count({
        where: { storeId: stores[i].id, status: OrderStatus.DELIVERED },
      });
      const canceled = await this.prisma.order.count({
        where: { storeId: stores[i].id, status: OrderStatus.CANCELLED },
      });
      const onGoing = await this.prisma.order.count({
        where: {
          storeId: stores[i].id,
          deliveryManId: { not: null },
          status: {
            not: OrderStatus.DELIVERED,
          },
        },
      });

      data.push({
        ...stores[i],
        totalOrders,
        totalDeliveredOrders,
        completion: (totalDeliveredOrders / totalOrders) * 100,
        onGoing,
        canceled,
      });
    }
    return localizedObject(data, locale);
  }
}
