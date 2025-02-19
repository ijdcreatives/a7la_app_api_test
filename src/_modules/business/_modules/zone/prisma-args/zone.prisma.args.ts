import { CreatedBy, Prisma, Roles, Zone } from '@prisma/client';
import { paginateOrNot } from 'src/globals/helpers/pagination-params';
import { filterKey, orderKey } from 'src/globals/helpers/prisma-filters';
import { FilterZoneDTO } from '../dto/zone.dto';

export const getArgs = (query: FilterZoneDTO, locale: Locale, Role: Roles) => {
  const { orderBy, page, limit, ...filter } = query;
  const Locale = locale.toLowerCase().charAt(0).toUpperCase() + locale.slice(1);

  const searchArray = [
    filterKey<Zone>(filter, 'id'),
    { createdBy: CreatedBy.ADMIN },
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
      ...(Role !== Roles.ADMIN ? { isActive: true } : {}),
    },
  ]

    .filter((x) => x)
    .flat();

  const orderArray = [
    orderKey('id', `id`, orderBy),
    orderKey('name', `name${Locale}`, orderBy),
    ,
  ].filter(Boolean) as Prisma.ZoneOrderByWithRelationInput[];
  if (Role === Roles.ADMIN)
    orderArray.push({
      createdAt: 'desc',
    });
  return {
    ...paginateOrNot({ limit, page }, query?.id),
    orderBy: orderArray,
    where: {
      AND: searchArray,
    },
  } satisfies Prisma.ZoneFindManyArgs;
};
//

export const VendorSelectArgs = () => {
  const selectArgs: Prisma.ZoneSelect = {
    id: true,
    nameAr: true,
    nameEn: true,
    displayAr: true,
    displayEn: true,
    Point: true,
  };
  return selectArgs;
};
export const AdminSelectArgs = () => {
  const selectArgs: Prisma.ZoneSelect = {
    id: true,
    nameAr: true,
    nameEn: true,
    displayAr: true,
    displayEn: true,
    isActive: true,
    digital: true,
    cash: true,
    offline: true,
    Point: true,
    _count: {
      select: {
        Store: true,
      },
    },
  };
  return selectArgs;
};
export const getArgsWithIncludeZone = (role: Roles) => {
  const selectObjects = {
    ADMIN: AdminSelectArgs(),
    CUSTOMER: VendorSelectArgs(),
    DELIVERY: VendorSelectArgs(),
    VENDOR: VendorSelectArgs(),
  };
  return {
    select: selectObjects[role],
  } satisfies Prisma.ZoneFindManyArgs;
};
