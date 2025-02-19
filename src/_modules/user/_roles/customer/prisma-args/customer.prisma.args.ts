import { Customer, Prisma, Roles } from '@prisma/client';
import { paginateOrNot } from 'src/globals/helpers/pagination-params';
import { filterKey } from 'src/globals/helpers/prisma-filters';
import { FilterCustomerDTO } from '../dto/customer.dto';

export const getArgs = (query: FilterCustomerDTO, role: Roles) => {
  const { orderBy, page, limit, ...filter } = query;
  const searchArray = [
    filterKey<Customer>(filter, 'id'),
    filter.CustomerDateFrom
      ? {
          createdAt: {
            gte: filter.CustomerDateFrom,
          },
        }
      : undefined,

    filter.CustomerDateTo
      ? {
          createdAt: {
            lte: filter.CustomerDateTo,
          },
        }
      : undefined,

    filter.OrderDateFrom
      ? {
          User: {
            Order: {
              some: {
                date: {
                  gte: filter.OrderDateFrom,
                },
              },
            },
          },
        }
      : undefined,
    filter.OrderDateTo
      ? {
          User: {
            Order: {
              some: {
                date: {
                  lte: filter.OrderDateTo,
                },
              },
            },
          },
        }
      : undefined,
  ].filter(Boolean) as Prisma.CustomerWhereInput[];

  const orderArray = [
    role === Roles.ADMIN ? { createdAt: 'desc' } : undefined,
  ].filter(Boolean) as Prisma.CustomerOrderByWithRelationInput[];
  return {
    ...paginateOrNot({ limit, page }, query?.id),
    where: {
      AND: searchArray,
    },
    orderBy: orderArray,
  } satisfies Prisma.CustomerFindManyArgs;
};

export const selectCustomerArgs = () => {
  const selectArgs: Prisma.CustomerSelect = {
    email: true,
    phone: true,
    User: {
      select: {
        id: true,
        name: true,
        image: true,
      },
    },
    _count: { select: { Orders: true } },
    createdAt: true,
  };

  return selectArgs;
};

export const getArgsWithCustomerSelect = () => {
  return {
    select: selectCustomerArgs(),
  } satisfies Prisma.CustomerFindManyArgs;
};
