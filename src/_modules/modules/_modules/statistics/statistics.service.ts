import { Injectable } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/globals/services/prisma.service';
import { ModuleStatisticsFilterDTO } from './dtos/filter.dto';
import {
  customerFilters,
  deliveryFilters,
  getCustomerAndDeliveryArgs,
  getProductArgs,
  getStoreArgs,
  moduleArgs,
  orderFilters,
  storeFilters,
} from './statistics.prisma.args';

@Injectable()
export class ModuleStatisticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCards(filters: ModuleStatisticsFilterDTO) {
    const args = moduleArgs(filters);
    const module = await this.prisma.module.findUnique(args);

    const items = module?.product?.length || 0;

    const orders =
      module?.product
        ?.map((p) => p.OrderItem?.at(0)?.Order)
        .filter((o) => o !== undefined) || [];

    const ordersLength = module?.product?.map((p) => p.OrderItem.length) || [];

    const ordersCount = ordersLength?.reduce((a, b) => a + b, 0);

    const stores = module?.store?.length || 0;

    const customers = Array.from(
      new Set(
        module?.product
          .map((p) => p.OrderItem)
          .map((items) => items?.at(0)?.Order?.customerId),
      ),
    ).length;

    const unAssignedOrders = orders?.filter((o) => {
      return (
        o.onTheWayAt !== null &&
        (o.status == OrderStatus.ACCEPTED ||
          o.status == OrderStatus.HANDED_OVER)
      );
    }).length;

    const refunded = orders.filter(
      (o) => o.status === OrderStatus.REFUND,
    ).length;

    const canceled = orders.filter(
      (o) => o.status === OrderStatus.CANCELLED,
    ).length;

    const paymentFailed = orders.filter(
      (o) => o.status === OrderStatus.PAYMENT_FAILED,
    ).length;

    const onTheWay = orders.filter(
      (o) => o.status === OrderStatus.ON_THE_WAY,
    ).length;

    const delivered = orders.filter(
      (o) => o.status === OrderStatus.DELIVERED,
    ).length;

    const packaging = orders.filter(
      (o) => o.status === OrderStatus.HANDED_OVER,
    ).length;

    const acceptedByDeliveryMan = orders.filter(
      (o) => o.status === OrderStatus.WAITING_DELIVERY,
    ).length;

    return {
      items,
      ordersCount,
      stores,
      customers,
      unAssignedOrders,
      refunded,
      canceled,
      paymentFailed,
      onTheWay,
      delivered,
      packaging,
      acceptedByDeliveryMan,
    };
  }

  async getMonthlyChart(filters: ModuleStatisticsFilterDTO) {
    const orders = await this.prisma.order.findMany({
      where: orderFilters(filters),
      select: {
        createdAt: true,
        adminCommission: true,
        deliveryCommission: true,
        price: true,
      },
    });
    const monthlyData = orders.reduce(
      (acc, item) => {
        const date = new Date(item.createdAt);
        const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!acc[yearMonth]) {
          acc[yearMonth] = {
            adminCommission: 0,
            deliveryCommission: 0,
            price: 0,
          };
        }

        acc[yearMonth].adminCommission += +item.adminCommission;
        acc[yearMonth].deliveryCommission += +item.deliveryCommission;
        acc[yearMonth].price += +item.price;
        return acc;
      },
      {} as Record<
        string,
        { adminCommission: number; deliveryCommission: number; price: number }
      >,
    );
    const monthlyDataArray = Object.entries(monthlyData).map(
      ([key, value]) => ({
        month: key, // Example: "2024-01"
        count: value, // Example: 250
      }),
    );
    return monthlyDataArray;
  }

  async getUsersStatistics(filters: ModuleStatisticsFilterDTO) {
    const customers = await this.prisma.customer.count({
      where: customerFilters(filters),
    });

    const deliveryMen = await this.prisma.delivery.count({
      where: deliveryFilters(filters),
    });

    const stores = await this.prisma.store.count({
      where: storeFilters(filters),
    });

    return {
      customers,
      deliveryMen,
      stores,
    };
  }

  async getCounts(filters: ModuleStatisticsFilterDTO) {
    const storeArgs = getStoreArgs(filters);
    const productArgs = getProductArgs(filters);
    const customerArgs = getCustomerAndDeliveryArgs(filters, 'customer');
    const deliveryArgs = getCustomerAndDeliveryArgs(filters, 'delivery');

    const topStores = await this.prisma.store.findMany({
      ...storeArgs,
      orderBy: { Order: { _count: 'desc' } },
    });

    const mostPopStores = await this.prisma.store.findMany({
      ...storeArgs,
      orderBy: { FavoriteStore: { _count: 'desc' } },
    });

    const topProducts = await this.prisma.product.findMany({
      ...productArgs,
      orderBy: { OrderItem: { _count: 'desc' } },
    });

    const topRatedProducts = await this.prisma.product.findMany({
      ...productArgs,
      orderBy: { rating: 'desc' },
    });

    const topRatedDeliveryMan = await this.prisma.delivery.findMany({
      ...deliveryArgs,
      orderBy: { rating: 'desc' },
    });

    const topCustomers = await this.prisma.customer.findMany({
      ...customerArgs,
      orderBy: { Orders: { _count: 'desc' } },
    } as Prisma.CustomerFindManyArgs);

    return {
      topStores,
      topProducts,
      topRatedProducts,
      topRatedDeliveryMan,
      topCustomers,
      mostPopStores,
    };
  }
}
