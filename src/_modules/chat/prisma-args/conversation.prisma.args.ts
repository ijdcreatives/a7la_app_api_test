import { Prisma } from '@prisma/client';
import { paginateOrNot } from '../../../globals/helpers/pagination-params';
import { FilterConversationDto, FilterMessageDto } from '../dto/chat.dto';

export const getArgs = (query: FilterConversationDto, userId: Id) => {
  const { page, limit } = query;
  const searchArray = [
    {
      UserConversation: {
        some: {
          userId,
        },
      },
    },
  ]
    .filter((x) => x)
    .flat();

  if (query.id) {
    return {
      where: {
        id: query.id,
        AND: searchArray,
      },
      include: {
        ...includeArgs,
        Message: {
          select: {
            id: true,
            content: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
          ...paginateOrNot({ limit, page }, null),
          take: undefined,
        },
      },
    } satisfies Prisma.ConversationFindManyArgs;
  }
  return {
    ...paginateOrNot({ limit, page }, query?.id),
    where: {
      AND: searchArray,
    },
  } satisfies Prisma.ConversationFindManyArgs;
};

const includeArgs = (userId: Id): Prisma.ConversationSelect => {
  return {
    _count: {
      select: {
        Message: {
          where: {
            receiverId: userId,
            read: false,
          },
        },
      },
    },
    Message: {
      take: 1,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        createdAt: true,
        content: true,
      },
    },

    UserConversation: {
      take: 1,
      where: {
        userId: {
          not: userId,
        },
      },
      select: {
        User: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    },
  };
};

export const getArgsWithIncludeConversation = (userId: Id) => {
  return {
    include: includeArgs(userId),
  } satisfies Prisma.ConversationFindManyArgs;
};

export const getMessageArgs = (query: FilterMessageDto) => {
  const { page, limit, id } = query;
  const searchArray = [{ conversationId: id }].filter((x) => x).flat();

  return {
    ...paginateOrNot({ limit, page }, id),
    where: {
      AND: searchArray,
    },
  } satisfies Prisma.MessageFindManyArgs;
};
