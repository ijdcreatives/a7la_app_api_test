import { LoyaltyPoint, Prisma } from '@prisma/client';
import { paginateOrNot } from 'src/globals/helpers/pagination-params';
import { filterKey, orderKey } from 'src/globals/helpers/prisma-filters';
import { FilterLoyaltyPointDTO } from '../dto/loyaltyPoint.dto';

export const getArgs = (query: FilterLoyaltyPointDTO) => {
  const { orderBy, page, limit, ...filter } = query;

  const searchArray = [
    filterKey<LoyaltyPoint>(filter, 'id'),
    filterKey<LoyaltyPoint>(filter, 'type'),
    filterKey<LoyaltyPoint>(filter, 'customerId'),

    filter.loyaltyDateFrom
      ? {
          createdAt: {
            gte: filter.loyaltyDateFrom,
          },
        }
      : undefined,
    filter.loyaltyDateTo
      ? {
          createdAt: {
            lte: filter.loyaltyDateTo,
          },
        }
      : undefined,
  ]

    .filter((x) => x)
    .flat();

  const orderArray = [orderKey('id', `id`, orderBy), ,].filter(
    Boolean,
  ) as Prisma.LoyaltyPointOrderByWithRelationInput[];

  return {
    ...paginateOrNot({ limit, page }, query?.id),
    orderBy: orderArray,
    where: {
      AND: searchArray,
    },
  } satisfies Prisma.LoyaltyPointFindManyArgs;
};
//
