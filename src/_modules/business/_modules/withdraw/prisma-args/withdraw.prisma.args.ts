import { Prisma, Withdraw } from '@prisma/client';
import { paginateOrNot } from 'src/globals/helpers/pagination-params';
import { filterKey } from 'src/globals/helpers/prisma-filters';
import { FilterWithdrawDTO } from '../dto/withdraw.dto';

export const getWithdrawArgs = (query: FilterWithdrawDTO) => {
  const { page, limit, ...filter } = query;
  const searchArray = [
    filterKey<Withdraw>(filter, 'id'),
    filterKey<Withdraw>(filter, 'storeId'),
    filterKey<Withdraw>(filter, 'deliveryManId'),
    filterKey<Withdraw>(filter, 'status'),
    filter.store
      ? {
          store: {
            OR: [
              {
                nameEn: filter.store,
              },
              {
                nameAr: filter.store,
              },
            ],
          },
        }
      : {},
  ].filter(Boolean) as Prisma.WithdrawWhereInput[];

  const orderArray = [
    {
      createdAt: 'desc',
    },
  ].filter(Boolean) as Prisma.WithdrawOrderByWithRelationInput[];
  return {
    ...paginateOrNot({ limit, page }, query?.id),
    orderBy: orderArray,
    where: {
      AND: searchArray,
    },
  } as Prisma.WithdrawFindManyArgs;
};

export const selectWithdrawArgs = () => {
  const selectArgs: Prisma.WithdrawSelect = {
    id: true,
    amount: true,
    createdAt: true,
    status: true,
    Store: {
      select: {
        nameAr: true,
        nameEn: true,
      },
    },
  };
  return selectArgs;
};
export const getWithdrawArgsWithSelect = () => {
  return {
    select: selectWithdrawArgs(),
  } satisfies Prisma.WithdrawFindManyArgs;
};
