import { Plan, Prisma, Roles } from '@prisma/client';
import { filterKey, orderKey } from 'src/globals/helpers/prisma-filters';
import { FilterPlanDTO } from '../dto/plan.dto';

export const getArgs = (query: FilterPlanDTO, locale: Locale, Role: Roles) => {
  const { orderBy, page, limit, ...filter } = query;
  const Locale = locale.toLowerCase().charAt(0).toUpperCase() + locale.slice(1);

  const searchArray = [
    filterKey<Plan>(filter, 'id'),
    filter.name && {
      OR: [
        {
          nameEn: {
            contains: filter.name?.at(0),
          },
        },
        {
          nameAr: {
            contains: filter.name?.at(0),
          },
        },
      ],
    },
    {
      ...(Role === Roles.VENDOR ? { isActive: true } : {}),
    },
  ]

    .filter((x) => x)
    .flat();

  const orderArray = [
    orderKey('id', `id`, orderBy),
    orderKey('name', `name${Locale}`, orderBy),

    ,
  ].filter(Boolean) as Prisma.PlanOrderByWithRelationInput[];
  if (Role === Roles.ADMIN) {
    orderArray.push({
      createdAt: 'desc',
    });
  }
  return {
    orderBy: orderArray,
    where: {
      AND: searchArray,
    },
  } satisfies Prisma.PlanFindManyArgs;
};
//

export const selectArgs = (role: Roles) => {
  const selectArgs: Prisma.PlanSelect = {
    id: true,
    nameAr: true,
    nameEn: true,
    infoAr: true,
    infoEn: true,
    price: true,
    days: true,
    chat: true,
    pos: true,
    review: true,
    orders: true,
    items: true,
    isActive: role === Roles.ADMIN ? true : false,
  };
  return selectArgs;
};

export const selectSubscriptionSelectObject = () => {
  const selectArgs: Prisma.SubscriptionSelect = {
    id: true,
    Plan: {
      select: {
        nameAr: true,
        nameEn: true,
        price: true,
      },
    },
    startDate: true,
    expireDate: true,
    renew: true,
    isTrial: true,
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

export const selectSubscriptionSelectArgs = () => {
  return {
    select: selectSubscriptionSelectObject(),
  } satisfies Prisma.PlanFindManyArgs;
};

export const getArgsWithIncludePlan = (role: Roles) => {
  return {
    select: selectArgs(role),
  } satisfies Prisma.PlanFindManyArgs;
};
