import { Order, Prisma, Transaction } from '@prisma/client';
import { paginateOrNot } from 'src/globals/helpers/pagination-params';
import { filterKey, orderKey } from 'src/globals/helpers/prisma-filters';
import {
  FilterTransactionDTO,
  FilterTransactionReportDTO,
} from '../dto/transaction.dto';

export const getTransactionArgs = (query: FilterTransactionDTO) => {
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

//
export const transactionSelectArgs = () => {
  const selectArgs: Prisma.TransactionSelect = {
    id: true,
    credit: true,
    debit: true,
    balance: true,
    createdAt: true,
    type: true,
    Customer: {
      select: {
        User: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    },
  };
  return selectArgs;
};
export const transactionReportSelectArgs = () => {
  const selectArgs: Prisma.OrderSelect = {
    id: true,
    totalPrice: true,
    Store: {
      select: {
        nameAr: true,
        nameEn: true,
      },
    },
    Customer: {
      select: {
        User: {
          select: {
            name: true,
          },
        },
      },
    },
    discountAmount: true,
    tax: true,
    shipping: true,
    paymentMethod: true,
    paymentStatus: true,
    ParcelOrder: true,
    createdAt: true,
  };
  return selectArgs;
};
export const getTransactionArgsWithSelect = () => {
  return {
    select: transactionSelectArgs(),
  } satisfies Prisma.TransactionFindManyArgs;
};
export const getTransactionReportArgsWithSelect = () => {
  return {
    select: transactionReportSelectArgs(),
  } satisfies Prisma.OrderFindManyArgs;
};

export const getReportArgs = (query: FilterTransactionReportDTO) => {
  const { page, limit, ...filter } = query;

  const searchArray = [
    filterKey<Order>(filter, 'id'),
    filterKey<Order>(filter, 'storeId'),
    filter.moduleId
      ? {
          Store: {
            moduleId: filter.moduleId,
          },
        }
      : undefined,
    filter.zoneId
      ? {
          Store: {
            zoneId: filter.zoneId,
          },
        }
      : undefined,

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

  return {
    ...paginateOrNot({ limit, page }, query?.id),
    where: {
      AND: searchArray,
    },
  } satisfies Prisma.OrderFindManyArgs;
};
