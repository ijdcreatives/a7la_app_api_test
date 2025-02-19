import { Prisma } from '@prisma/client';
import { filterKey } from 'src/globals/helpers/prisma-filters';
import { FilterBankDTO } from './dtos/filter.dto';

export function getBankArgs(filters: FilterBankDTO) {
  const searchArray = [
    filterKey(filters, 'deliveryManId'),
    filterKey(filters, 'id'),
    filterKey(filters, 'bankId'),
  ].filter(Boolean) as Prisma.DeliveryBankWhereInput[];

  return {
    where: {
      AND: searchArray,
    },
  } satisfies Prisma.DeliveryBankFindManyArgs;
}
