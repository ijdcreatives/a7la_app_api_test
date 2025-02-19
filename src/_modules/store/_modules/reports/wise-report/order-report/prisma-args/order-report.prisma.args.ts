import { Order, Prisma } from '@prisma/client';
import { paginateOrNot } from 'src/globals/helpers/pagination-params';
import { filterKey } from 'src/globals/helpers/prisma-filters';
import { FilterOrderReportDTO } from '../dto/order-report.dto';

export const getArgs = (query: FilterOrderReportDTO) => {
  const { page, limit, ...filter } = query;
  const searchArray = [
    filterKey<Order>(filter, 'id'),
    filterKey<Order>(filter, 'storeId'),
    filter.zoneId && {
      Store: {
        zoneId: {
          in: filter.zoneId,
        },
      },
    },
    filter.from
      ? {
          createdAt: {
            gte: filter.from,
          },
        }
      : undefined,
    filter.to
      ? {
          createdAt: {
            lte: filter.to,
          },
        }
      : undefined,
  ]
    .filter((x) => x)
    .flat() as Prisma.OrderWhereInput['AND'];
  return {
    ...paginateOrNot({ limit, page }, query?.id),
    where: {
      AND: searchArray,
    },
  } satisfies Prisma.OrderFindManyArgs;
};

export const orderReportSelectSchema = () => {
  const selectArgs: Prisma.OrderSelect = {
    id: true,
    createdAt: true,
    tax: true,
    Customer: {
      select: {
        phone: true,
        User: {
          select: {
            name: true,
          },
        },
      },
    },
    price: true,
    paymentStatus: true,
    discountAmount: true,
    shipping: true,
  };
  return selectArgs;
};
export const orderReportSelectArgs = () => {
  return {
    select: orderReportSelectSchema(),
  } satisfies Prisma.OrderFindManyArgs;
};
