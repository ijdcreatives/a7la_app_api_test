import { Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from 'src/globals/services/prisma.service';
import { FilterDeliverymanDTO } from '../dto/delivery.dto';
import { getStatisticsArgs } from '../prisma-args/delivery.statistics.prisma.args';

@Injectable()
export class DeliveryHelper {
  constructor(private readonly prisma: PrismaService) {}

  async getTotalOrders(filters: FilterDeliverymanDTO) {
    const args = getStatisticsArgs(filters);
    const totalOrders = await this.prisma.order.groupBy({
      by: ['status'],
      where: args.where,
      _count: true,
    });
    const data = {};
    Object.values(OrderStatus).map((status) => {
      // Find the status count if it exists in the result, otherwise default to 0
      const statusGroup = totalOrders.find((order) => order.status === status);
      data[status] = statusGroup ? statusGroup._count : 0;
    });
    return data;
  }

  getLastWeekRange(): { start: Date; end: Date } {
    const now = new Date();
    const end = new Date(now);
    end.setDate(now.getDate() - now.getDay()); // Last Sunday (end of the last week)
    const start = new Date(end);
    start.setDate(end.getDate() - 6); // Last Monday (start of the last week)
    return { start, end };
  }

  getLastMonthRange(): { start: Date; end: Date } {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1); // First day of last month
    const end = new Date(now.getFullYear(), now.getMonth(), 0); // Last day of last month
    return { start, end };
  }
}
