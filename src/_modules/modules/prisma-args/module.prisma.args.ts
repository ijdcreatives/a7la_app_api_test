import { Prisma, Roles } from '@prisma/client';
import { paginateOrNot } from 'src/globals/helpers/pagination-params';
import { filterKey } from 'src/globals/helpers/prisma-filters';
import { FilterModuleDTO } from '../dto/create-module.dto';

export const getWhereArgs = (query: FilterModuleDTO, role: Roles) => {
  const { orderBy, page, limit, ...filter } = query;
  const searchArray = [
    filterKey<Module>(filter, 'id'),
    role === Roles.ADMIN ? { isActive: true } : null,
    filter.name && {
      OR: [
        {
          nameAr: {
            contains: filter.name?.at(0),
          },
        },
        {
          nameEn: {
            contains: filter.name?.at(0),
          },
        },
      ],
    },
  ].filter(Boolean) as Prisma.ModuleWhereInput[];

  const orderArray = [].filter(
    Boolean,
  ) as Prisma.ModuleOrderByWithRelationInput[];

  if (role === Roles.ADMIN)
    orderArray.push({
      createdAt: 'desc',
    });
  return {
    ...paginateOrNot({ limit, page }, filter?.id || role === Roles.CUSTOMER),
    where: {
      AND: searchArray,
    },
    orderBy: orderArray,
  };
};

export const getSelectArgs = (role: Roles) => {
  const selectArgs: Prisma.ModuleSelect = {
    id: true,
    nameAr: true,
    nameEn: true,
    descriptionAr: true,
    descriptionEn: true,
    icon: true,
    type: true,
    thumbnail: true,
    isActive: role === Roles.ADMIN,
    ...(role === Roles.ADMIN
      ? {
          _count: {
            select: {
              store: true,
            },
          },
        }
      : {}),
  };
  return selectArgs;
};

export const getArgsWithSelect = (role: Roles) => {
  return {
    select: getSelectArgs(role),
  } satisfies Prisma.ModuleFindManyArgs;
};
