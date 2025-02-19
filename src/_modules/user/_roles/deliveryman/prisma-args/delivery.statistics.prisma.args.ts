import { Prisma } from '@prisma/client';
import { FilterDeliverymanDTO } from '../dto/delivery.dto';

export const getStatisticsArgs = (query: FilterDeliverymanDTO) => {
  const { ...filter } = query;
  const searchArray = [
    filter.id
      ? {
          deliveryManId: filter.id,
        }
      : undefined,
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
  ].filter(Boolean);

  return {
    where: {
      AND: searchArray,
    },
  } satisfies Prisma.DeliveryFindManyArgs;
};
