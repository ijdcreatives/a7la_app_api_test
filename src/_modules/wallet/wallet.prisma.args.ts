import { Prisma, Transaction } from '@prisma/client';
import { FilterTransactionDTO } from 'src/_modules/transaction/dto/transaction.dto';
import { paginateOrNot } from 'src/globals/helpers/pagination-params';
import { filterKey, orderKey } from 'src/globals/helpers/prisma-filters';

export const getArgs = (query: FilterTransactionDTO) => {
  const { orderBy, page, limit, ...filter } = query;

  const searchArray = [
    filterKey<Transaction>(filter, 'id'),
    filterKey<Transaction>(filter, 'type'),
    filterKey<Transaction>(filter, 'customerId'),

    filter.transactionDateFrom
      ? {
          createdAt: {
            gte: filter.transactionDateFrom,
          },
        }
      : undefined,
    filter.transactionDateTo
      ? {
          createdAt: {
            lte: filter.transactionDateTo,
          },
        }
      : undefined,
  ]

    .filter((x) => x)
    .flat();

  const orderArray = [orderKey('id', `id`, orderBy)].filter(
    Boolean,
  ) satisfies Prisma.TransactionOrderByWithRelationInput[];

  return {
    ...paginateOrNot({ limit, page }, query?.id),
    orderBy: orderArray,
    where: {
      AND: searchArray,
    },
  } satisfies Prisma.TransactionFindManyArgs;
};
