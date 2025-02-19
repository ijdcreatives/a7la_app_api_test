import { Prisma } from '@prisma/client';
import { paginateOrNot } from 'src/globals/helpers/pagination-params';
import { FilterSummaryReportDTO } from '../dto/summary-report.dto';

export const getSummaryProductReportArgs = (query: FilterSummaryReportDTO) => {
  const { page, limit, ...filter } = query;

  const searchArray = [
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
    .flat();
  return {
    ...paginateOrNot({ limit, page }, false),
    where: {
      AND: searchArray,
    },
  };
};

export const selectSummaryReportSchema = () => {
  const selectArgs: Prisma.StoreSelect = {
    id: true,
    nameAr: true,
    nameEn: true,
    _count: { select: { Order: true } },
    Order: {
      select: {
        totalPrice: true,
        discountAmount: true,
      },
    },
    createdAt: true,
  };
  return selectArgs;
};
export const selectSummaryReportArgs = () => {
  return {
    select: selectSummaryReportSchema(),
  } satisfies Prisma.StoreFindManyArgs;
};
