import { Order, Prisma } from '@prisma/client';
import { paginateOrNot } from 'src/globals/helpers/pagination-params';
import { filterKey } from 'src/globals/helpers/prisma-filters';
import { FilterSalesReportDTO } from '../dto/sales-report.dto';

export const getSalesReportArgs = (query: FilterSalesReportDTO) => {
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

export const getSalesProductReportArgs = (query: FilterSalesReportDTO) => {
  const { page, limit, ...filter } = query;
  const searchArray = [
    filter.storeId && {
      OrderItem: {
        some: {
          Order: {
            storeId: {
              in: filter.storeId,
            },
          },
        },
      },
    },

    filter.zoneId && {
      OrderItem: {
        some: {
          Order: {
            Store: {
              zoneId: {
                in: filter.zoneId,
              },
            },
          },
        },
      },
    },

    filter.from
      ? {
          OrderItem: {
            some: {
              Order: {
                createdAt: {
                  gte: filter.from,
                },
              },
            },
          },
        }
      : undefined,
    filter.to
      ? {
          OrderItem: {
            some: {
              Order: {
                createdAt: {
                  lte: filter.to,
                },
              },
            },
          },
        }
      : undefined,
  ]
    .filter((x) => x)
    .flat() as Prisma.ProductWhereInput['AND'];
  return {
    ...paginateOrNot({ limit, page }, query?.id),
    where: {
      AND: searchArray,
    },
  } satisfies Prisma.ProductFindManyArgs;
};

export const productReportSelectSchema = () => {
  const selectArgs: Prisma.ProductSelect = {
    id: true,
    price: true,
    totalPrice: true,
    grossSale: true,
    discountGrossSale: true,
    nameAr: true,
    nameEn: true,
    thumbnail: true,
    totalOrders: true,
  };
  return selectArgs;
};
export const selectSalesProductReportArgs = () => {
  return {
    select: productReportSelectSchema(),
  } satisfies Prisma.ProductFindManyArgs;
};
