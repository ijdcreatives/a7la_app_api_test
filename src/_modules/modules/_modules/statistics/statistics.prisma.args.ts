import {
  Customer,
  Delivery,
  Module,
  Order,
  Prisma,
  Product,
  Store,
} from '@prisma/client';
import { betweenDates } from 'src/globals/helpers/prisma-filters';
import { ModuleStatisticsFilterDTO } from './dtos/filter.dto';

const take = 5;

const storeSelect = {
  id: true,
  nameAr: true,
  nameEn: true,
  logo: true,
  _count: { select: { Order: true } },
} satisfies Prisma.StoreSelect;

const productSelect = {
  id: true,
  nameAr: true,
  nameEn: true,
  thumbnail: true,
  _count: { select: { OrderItem: true } },
} satisfies Prisma.ProductSelect;

const customerAndDeliverySelect = {
  id: true,
  User: {
    select: { image: true, name: true },
  },
  _count: { select: { Orders: true } },
} satisfies Prisma.CustomerSelect | Prisma.DeliverySelect;

export const storeFilters = (filters: ModuleStatisticsFilterDTO) => {
  return {
    moduleId: filters.moduleId,
    mainStoreId: null,
    ...betweenDates<Store>('createdAt', filters.dateFrom, filters.dateTo),
  } satisfies Prisma.StoreWhereInput;
};

export const customerFilters = (filters: ModuleStatisticsFilterDTO) => {
  return {
    ...betweenDates<Customer>('createdAt', filters.dateFrom, filters.dateTo),
    Orders: {
      some: {
        OrderItems: { some: { Product: { moduleId: filters.moduleId } } },
      },
    },
  } satisfies Prisma.CustomerWhereInput;
};

export const orderFilters = (filters: ModuleStatisticsFilterDTO) => {
  return {
    ...betweenDates<Order>('createdAt', filters.dateFrom, filters.dateTo),
    OrderItems: {
      some: { Product: { moduleId: filters.moduleId } },
    },
  } satisfies Prisma.OrderWhereInput;
};

export const deliveryFilters = (filters: ModuleStatisticsFilterDTO) => {
  return {
    ...betweenDates<Delivery>('createdAt', filters.dateFrom, filters.dateTo),
  } satisfies Prisma.DeliveryWhereInput;
};
export const productFilters = (filters: ModuleStatisticsFilterDTO) => {
  return {
    moduleId: filters.moduleId,
    ...betweenDates<Product>('createdAt', filters.dateFrom, filters.dateTo),
  } satisfies Prisma.ProductWhereInput;
};

export const moduleArgs = (filters: ModuleStatisticsFilterDTO) => {
  return {
    select: {
      product: {
        select: {
          OrderItem: {
            select: { Order: true },
          },
        },
      },
      store: {
        select: { id: true },
        where: {
          mainStoreId: null,
        },
      },
    },
    where: {
      id: filters.moduleId,
      ...betweenDates<Module>('createdAt', filters.dateFrom, filters.dateTo),
    },
  } satisfies Prisma.ModuleFindUniqueArgs;
};

export const getStoreArgs = (filters: ModuleStatisticsFilterDTO) => {
  return {
    select: storeSelect,
    where: { ...storeFilters(filters) },
    take,
  } satisfies Prisma.StoreFindManyArgs;
};

export const getProductArgs = (filters: ModuleStatisticsFilterDTO) => {
  return {
    select: productSelect,
    where: productFilters(filters),
    take,
  } satisfies Prisma.ProductFindManyArgs;
};

export const getCustomerAndDeliveryArgs = (
  filters: ModuleStatisticsFilterDTO,
  type: 'customer' | 'delivery',
) => {
  return {
    select: customerAndDeliverySelect,
    take,
    where:
      type === 'customer' ? customerFilters(filters) : deliveryFilters(filters),
  } satisfies Prisma.CustomerFindManyArgs & Prisma.DeliveryFindManyArgs;
};
