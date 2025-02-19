import { Injectable } from '@nestjs/common';
import { localizedObject } from 'src/globals/helpers/localized.return';
import { PrismaService } from 'src/globals/services/prisma.service';
import { FilterSalesReportDTO } from './dto/sales-report.dto';
import {
  getSalesProductReportArgs,
  getSalesReportArgs,
  selectSalesProductReportArgs,
} from './prisma-args/sales-report.prisma.args';

@Injectable()
export class SalesReportService {
  constructor(private readonly prisma: PrismaService) {}

  async getCards(filters: FilterSalesReportDTO, locale: Locale) {
    const getOrderArgs = getSalesReportArgs(filters);
    const grossSaleResult = await this.prisma.order.aggregate({
      where: getOrderArgs.where,
      _sum: { price: true },
    });
    const grossSale = grossSaleResult._sum.price || 0;
    const totalTaxResult = await this.prisma.order.aggregate({
      _sum: { tax: true },
      where: getOrderArgs.where,
    });
    const totalTax = totalTaxResult._sum.tax || 0;
    const totalCommissionResult = await this.prisma.order.aggregate({
      where: getOrderArgs.where,
      _sum: { adminCommission: true, deliveryCommission: true },
    });
    const totalCommission =
      totalCommissionResult._sum.adminCommission +
        totalCommissionResult._sum.deliveryCommission || 0;

    const storeEarningResult = await this.prisma.wallet.aggregate({
      _sum: { totalEarning: true },
    });
    const totalStoreEarning = storeEarningResult._sum.totalEarning || 0;

    const { groupedByYear: yearOrderChart } =
      await this.getYearlyChart(filters);

    const data = await this.getSalesReport(filters);
    return {
      table: localizedObject(data, locale),
      grossSale,
      totalTax,
      totalCommission,
      totalStoreEarning,
      yearOrderChart,
    };
  }

  async getYearlyChart(_filters: any) {
    const getOrderArgs = getSalesReportArgs(_filters);
    const orders = await this.prisma.order.findMany({
      ...getOrderArgs,
    });

    const groupedByYear = orders.reduce((acc, order) => {
      const year = new Date(order.createdAt).getFullYear();
      if (!acc[year]) {
        acc[year] = 0;
      }
      acc[year] += order.price;
      return acc;
    }, {});

    return { groupedByYear };
  }

  async getSalesReport(filters: FilterSalesReportDTO) {
    const productArgs = getSalesProductReportArgs(filters);
    const selectProductArgs = selectSalesProductReportArgs();

    const data = await this.prisma.product.findMany({
      ...productArgs,
      ...selectProductArgs,
    });
    return data;
  }
}
