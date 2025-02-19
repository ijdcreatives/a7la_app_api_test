import { Prisma, User } from '@prisma/client';
import { paginateOrNot } from 'src/globals/helpers/pagination-params';
import { search } from 'src/globals/helpers/prisma-filters';
import { FilterUserDTO } from '../dto/filter.dto';

export const getArgs = (query: FilterUserDTO) => {
  const { orderBy, page, limit, ...filter } = query;
  const searchArray = [].filter((x) => x).flat();
  return {
    ...paginateOrNot({ limit, page }, query?.id?.length),
    orderBy,
    where: {
      AND: searchArray,
    },
  } satisfies Prisma.UserFindManyArgs;
};
