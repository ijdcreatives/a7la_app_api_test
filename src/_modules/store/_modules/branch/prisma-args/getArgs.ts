import { Prisma } from '@prisma/client';
import { paginateOrNot } from 'src/globals/helpers/pagination-params';
import { FilterBranchDTO } from '../dto/branch.dto';

export const getBranchArgs = (query: FilterBranchDTO) => {
  const { page, limit } = query;

  return {
    ...paginateOrNot({ limit, page }, false),
  } satisfies Prisma.StoreFindManyArgs;
};
