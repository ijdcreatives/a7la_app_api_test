import { Roles } from '@prisma/client';
import { paginateOrNot } from 'src/globals/helpers/pagination-params';
import { filterKey, orderKey } from 'src/globals/helpers/prisma-filters';
import { FilterEmployeeDTO } from '../dto/register.dto';

export const getEmployeeArgs = (
  query: FilterEmployeeDTO,
  locale: Locale,
  storeId: Id,
  role: Roles,
) => {
  const { orderBy, page, limit, ...filter } = query;
  const Locale = locale.toLowerCase().charAt(0).toUpperCase() + locale.slice(1);
  const searchArray = [
    filterKey(filter, 'id'),
    filter.name &&
      !filter.id && {
        User: {
          OR: [
            {
              firstName: {
                contains: filter.name?.at(0),
              },
            },
            {
              lastName: {
                contains: filter.name?.at(0),
              },
            },
          ],
        },
      },

    { storeId: storeId ? { equals: storeId } : undefined },
  ]
    .filter((x) => x)
    .flat();
  const orderArray = [
    orderKey('id', `User.id`, orderBy),
    orderKey('name', `User.firstName`, orderBy),
    orderKey('name', `User.lastName`, orderBy),
    orderKey('email', `User.email`, orderBy),
    orderKey('phone', `User.phone`, orderBy),
    orderKey('role', `Role.name${Locale}`, orderBy),
  ].filter(Boolean);
  if (role === Roles.ADMIN) {
    orderArray.push({ createdAt: 'desc' });
  }
  return {
    ...paginateOrNot({ limit, page }, query?.id),
    orderBy: orderArray,
    where: { AND: searchArray },
  };
};
