import { Prisma } from '@prisma/client';
import { paginateOrNot } from '../../globals/helpers/pagination-params';
import { UserFiltrationDTO } from './dto/filters.dto';

export const JoinedUserDataSelect = {
  id: true,
  name: true,
  Customer: true,
} satisfies Prisma.UserSelect;

export const UserDataSelect = {
  ...JoinedUserDataSelect,
} satisfies Prisma.UserSelect;

export const PlainUserSelect = {
  ...UserDataSelect,
  image: true,
  isOnline: true,

  _count: {
    select: {
      Coupon: true,
    },
  },

  // acceptNotification: true,
} satisfies Prisma.UserSelect;

export const UsersSelect = {
  ...PlainUserSelect,
};

export const UserSelect = {
  ...UsersSelect,
} satisfies Prisma.UserSelect;

export const GetUsersArgs = (
  paginationParams: PaginationParams,
  id?: Id,
  filters: UserFiltrationDTO = {},
) => {
  return {
    ...paginateOrNot(paginationParams, id),

    where: {
      id: id ? id : filters.id?.length ? { in: filters.id } : undefined,
    },
    select: id ? UserSelect : UsersSelect,
  } satisfies Prisma.UserFindManyArgs;
};

export const joinedUserArgs = {
  select: JoinedUserDataSelect,
} satisfies Prisma.UserFindManyArgs;

export const OrderUserDataArgs = {
  select: {
    id: true,
    name: true,
    image: true,
  },
} satisfies Prisma.UserFindManyArgs;

export const JoinedChatRoomDataSelect = {
  id: true,
  name: true,
} satisfies Prisma.UserSelect;
