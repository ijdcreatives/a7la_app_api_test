import { Delivery, Prisma, User } from '@prisma/client';
import { paginateOrNot } from 'src/globals/helpers/pagination-params';
import { filterKey, search } from 'src/globals/helpers/prisma-filters';
import { FilterDeliverymanDTO, SortNeighborDTO } from '../dto/delivery.dto';

export const getArgs = (query: FilterDeliverymanDTO) => {
  const { orderBy, page, limit, ...filter } = query;
  const searchArray = [
    filterKey<Delivery>(filter, 'id'),
    filterKey<Delivery>(filter, 'online'),
    filterKey<Delivery>(filter, 'status'),
    search<Delivery>(filter, 'email'),
    search<Delivery>(filter, 'phone'),
    filter.date
      ? {
          createdAt: {
            gte: filter.date,
          },
        }
      : undefined,

    {
      deletedAt: null,
    },
    filter.name
      ? {
          OR: [
            {
              firstName: {
                contains: filter.name?.at(0),
              },
            },
            {
              lastName: {
                contains: filter.name?.at(0),
              },
            },
          ],
        }
      : undefined,
  ].filter(Boolean) as Prisma.DeliveryWhereInput[];

  const orderByArgs = handleOrderBy(orderBy);
  return {
    ...paginateOrNot({ limit, page }, query?.id),
    orderBy: orderByArgs,
    where: {
      AND: searchArray,
    },
  } satisfies Prisma.DeliveryFindManyArgs;
};

const handleOrderBy = (orderBy?: SortNeighborDTO[]) => {
  if (!orderBy) return undefined;

  const orderByArgs: Prisma.DeliveryOrderByWithRelationInput[] = [];

  for (let i = 0; i < orderBy.length; i++) {
    const parsedOrderBy = JSON.parse(orderBy[i] as string);
    if (parsedOrderBy.name) {
      orderByArgs.push({
        User: {
          name: parsedOrderBy.name,
        },
      });
      orderByArgs.push({
        User: {
          name: parsedOrderBy.name,
        },
      });
    } else if (parsedOrderBy.isOnline) {
      orderByArgs.push({
        User: {
          isOnline: parsedOrderBy.isOnline,
        },
      });
    } else {
      orderByArgs.push(parsedOrderBy);
    }
  }
  orderByArgs.push({ createdAt: 'desc' });

  return orderByArgs;
};
export const selectArgs = () => {
  const selectArgs: Prisma.DeliverySelect = {
    _count: {
      select: {
        Orders: true,
      },
    },
    id: true,
    status: true,
    rating: true,
    Wallet: true,
    identifyImage: true,
    identifyNumber: true,
    Review: true,
    cityId: true,
    nationalityId: true,
    User: {
      select: {
        id: true,
        name: true,
        image: true,
        isOnline: true,
      },
    },
  };
  return selectArgs;
};

export const getDeliveryArgsWithSelect = () => {
  return {
    select: selectArgs(),
  } satisfies Prisma.DeliveryFindManyArgs;
};
