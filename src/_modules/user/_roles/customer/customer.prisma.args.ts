import { Prisma } from '@prisma/client';
import { paginateOrNot } from 'src/globals/helpers/pagination-params';
import { JoinedChatRoomDataSelect } from '../../user.prisma.args';

export const CustomerChatArgs = {
  select: { User: { select: JoinedChatRoomDataSelect } },
} satisfies Prisma.CustomerFindManyArgs;

const customersSelect = {
  id: true,
  phone: true,
  User: { select: { name: true } },
} satisfies Prisma.CustomerSelect;

const customerSelect = {
  ...customersSelect,
  User: {
    select: {
      id: true,
      name: true,
      image: true,
    },
  },
} satisfies Prisma.CustomerSelect;

export const getCustomersArgs = (
  paginationParams: PaginationParams,
  id: Id,
): Prisma.CustomerFindManyArgs => {
  const args: Prisma.CustomerFindManyArgs = {
    ...paginateOrNot(paginationParams, id),
  };
  if (id) {
    args.where = { id };
    args.select = customerSelect;
    return args;
  }

  return args;
};
