import { Prisma, Roles, RoleType } from '@prisma/client';
import { paginateOrNot } from 'src/globals/helpers/pagination-params';
import { filterKey, orderKey } from 'src/globals/helpers/prisma-filters';
import { FindRoleDTO } from '../dto/role.dto';

export const getOrderArgs = (
  query: FindRoleDTO,
  locale: Locale,
  baseRole: Roles,
  storeId: Id,
  role: Roles,
) => {
  const { orderBy, page, limit, ...filter } = query;
  const Locale = locale.toLowerCase().charAt(0).toUpperCase() + locale.slice(1);
  const searchArray = [
    filterKey(filter, 'id'),
    filter.name &&
      !filter.id && {
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
    !filter.id && {
      type: baseRole === Roles.ADMIN ? RoleType.ADMIN : RoleType.STORE,
      storeId,
    },
  ]
    .filter((x) => x)
    .flat();
  const orderArray = [orderKey('name', `name${Locale}`, orderBy)].filter(
    Boolean,
  ) as Prisma.RoleOrderByWithRelationInput[];
  if (role === Roles.ADMIN) {
    orderArray.push({ createdAt: 'desc' });
  }
  return {
    ...paginateOrNot({ limit, page }, query?.id),
    orderBy: orderArray,
    where: { AND: searchArray },
  } satisfies Prisma.RoleFindManyArgs;
};
