import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../globals/services/prisma.service';
import { HandelFiles } from '../../media/helpers/handel-types';

import { Roles } from '@prisma/client';
import { firstOrMany } from '../../../globals/helpers/first-or-many';
import {
  CreateConversationDto,
  CreateMessageDto,
  FilterConversationDto,
  FilterMessageDto,
  JoinConversationDto,
} from '../dto/chat.dto';
import { AuthenticatedSocket } from '../interfaces/socket.interface';
import { UserConversation } from '../interfaces/userConversation.interface';
import {
  getArgs,
  getArgsWithIncludeConversation,
  getMessageArgs,
} from '../prisma-args/conversation.prisma.args';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  private async validateConversationAccess(data: UserConversation) {
    const conversation = await this.prisma.userConversation.findFirst({
      where: {
        userId: data.userId,
        role: data.role,
        conversationId: data.conversationId,
      },
    });

    return conversation;
  }

  private async conversationFound(
    data: CreateConversationDto,
    userId: Id,
    role: Roles,
    client: AuthenticatedSocket,
  ) {
    let conversation = await this.prisma.conversation.findFirst({
      where: {
        AND: [
          {
            UserConversation: {
              some: {
                userId: data.receiverId,
                role: data.receiverRole,
              },
            },
          },
          {
            UserConversation: {
              some: {
                userId,
                role,
              },
            },
          },
        ],
      },
    });
    if (!conversation) {
      conversation = await this.createConversation(data, userId, role);
      client.join(`conversation_${conversation.id}`);
    }
    return conversation;
  }
  //
  async createConversation(
    data: CreateConversationDto,
    userId: Id,
    role: Roles,
  ) {
    const conversation = await this.prisma.conversation.create({
      data: {
        UserConversation: {
          createMany: {
            data: [
              {
                userId,
                role,
              },
              {
                userId: data.receiverId,
                role: data.receiverRole,
              },
            ],
          },
        },
      },
    });

    return conversation;
  }

  async createConversationWithDto(
    data: CreateConversationDto,
    userId: Id,
    role: Roles,
  ) {
    const existingConversation = await this.prisma.conversation.findFirst({
      where: {
        AND: [
          {
            UserConversation: {
              some: {
                userId: data.receiverId,
                role: data.receiverRole,
              },
            },
          },
          {
            UserConversation: {
              some: {
                userId,
                role,
              },
            },
          },
        ],
      },
      include: {
        UserConversation: {
          include: {
            User: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (existingConversation) {
      return existingConversation;
    }

    // Create new conversation if it doesn't exist
    const conversation = await this.prisma.conversation.create({
      data: {
        UserConversation: {
          createMany: {
            data: [
              {
                userId,
                role,
              },
              {
                userId: data.receiverId,
                role: data.receiverRole,
              },
            ],
          },
        },
      },
      include: {
        UserConversation: {
          include: {
            User: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    return conversation;
  }

  async joinConversation(
    data: JoinConversationDto,
    client: AuthenticatedSocket,
  ) {
    const isFound = await this.validateConversationAccess({
      conversationId: data.conversationId,
      userId: client.user?.userId,
      role: client.user?.baseRole,
    });

    if (!isFound)
      throw new ForbiddenException(
        'you_are_not_allowed_to_join_this_conversation',
      );

    client.join(`conversation_${data.conversationId}`);
  }

  async leaveConversation(
    data: JoinConversationDto,
    client: AuthenticatedSocket,
  ) {
    client.leave(`conversation_${data.conversationId}`);
  }

  async createMessage(data: CreateMessageDto, userId: Id, role: Roles) {
    data.file ? this.generateFilePaths(data.file, data) : Promise.resolve();
    const usersConversation = await this.prisma.userConversation.findFirst({
      where: {
        conversationId: data.conversationId,
        NOT: {
          userId: userId,
          role,
        },
      },
    });

    const [message] = await Promise.all([
      this.prisma.message.create({
        data: {
          content: data.content,
          senderId: userId,
          receiverId: usersConversation.userId,
          conversationId: data.conversationId,
        },

        select: {
          conversationId: true,
          content: true,
          type: true,
          createdAt: true,
          id: true,
          SenderMessage: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      }),
      this.isClientInRoom(
        `conversation_${data.conversationId}`,
        usersConversation.userId,
        usersConversation.role,
      ),
    ]);

    return message;
  }

  private generateFilePaths(files: string[], body: CreateMessageDto) {
    const fileData: { file?: UploadedFile[] } = {};

    if (files['file']?.length > 0) {
      fileData.file = files['file'];
    }

    HandelFiles.generatePath<{ file?: UploadedFile[] }, CreateMessageDto>(
      fileData,
      body,
      body.conversationId ?? 'Edited',
    );
  }

  private isClientInRoom(roomId: string, userId: number, role: Roles): boolean {
    const io = global.io;
    if (!io) return false;

    const room = io.sockets.adapter.rooms.get(roomId);
    if (!room) return false;

    for (const socketId of room) {
      const socket = io.sockets.sockets.get(socketId);
      if (
        socket &&
        (socket as AuthenticatedSocket).user?.userId === userId &&
        (socket as AuthenticatedSocket).user?.baseRole === role
      ) {
        return true;
      }
    }

    return false;
  }

  async getConversationUserIds(conversationId: number) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        UserConversation: { select: { userId: true, role: true } },
      },
    });
    return conversation.UserConversation;
  }

  async findAll(
    filters: FilterConversationDto,
    userId: number,
  ): Promise<{ conversations: any; total: number }> {
    const args = getArgs(filters, userId);
    const argsWithSelect = getArgsWithIncludeConversation(userId);
    const data = await this.prisma.conversation[firstOrMany(filters?.id)]({
      ...argsWithSelect,
      where: args.where,
    });
    if (filters.id) {
      await this.prisma.message.updateMany({
        where: { id: filters.id, receiverId: userId },
        data: { read: true },
      });
    }
    const total = filters?.id
      ? await this.prisma.message.count({
          where: { conversationId: filters.id },
        })
      : await this.prisma.conversation.count({ where: args.where });

    return { conversations: data, total };
  }
  async findConversationByOrderId(role: Roles, orderId: Id, userId: Id) {
    const secondUser = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: {
        Customer: {
          select: {
            id: true,
          },
        },
        DeliveryMan: {
          select: {
            id: true,
          },
        },
      },
    });
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        OR: [
          {
            AND: [
              {
                UserConversation: {
                  some: {
                    userId: userId,
                    role: 'CUSTOMER',
                  },
                },
              },
              {
                UserConversation: {
                  some: {
                    userId: secondUser.DeliveryMan.id,
                    role: 'DELIVERY',
                  },
                },
              },
            ],
          },
          {
            AND: [
              {
                UserConversation: {
                  some: {
                    userId: secondUser.Customer.id,
                    role: 'DELIVERY',
                  },
                },
              },
              {
                UserConversation: {
                  some: {
                    userId: userId,
                    role: 'CUSTOMER',
                  },
                },
              },
            ],
          },
        ],
      },
      select: {
        id: true,
        UserConversation: {
          where: {
            AND: [
              {
                userId: {
                  not: userId,
                },
              },
              {
                role: {
                  not: role === 'CUSTOMER' ? 'CUSTOMER' : 'DELIVERY',
                },
              },
            ],
          },
          select: {
            User: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });
    if (conversation) {
      return conversation;
    }
    if (!conversation) {
      let conversation;
      if (role === Roles.CUSTOMER) {
        const createdConversation = await this.prisma.conversation.create({});
        await this.prisma.userConversation.createMany({
          data: [
            {
              userId,
              conversationId: createdConversation.id,
              role: 'CUSTOMER',
            },
            {
              userId: secondUser.DeliveryMan.id,
              conversationId: createdConversation.id,
              role: 'DELIVERY',
            },
          ],
        });
        conversation = await this.prisma.conversation.findUnique({
          where: {
            id: createdConversation.id,
          },

          select: {
            id: true,
            UserConversation: {
              where: {
                AND: [
                  {
                    userId: {
                      not: userId,
                    },
                  },
                  {
                    role: {
                      not: 'CUSTOMER',
                    },
                  },
                ],
              },
              select: {
                User: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                  },
                },
              },
            },
          },
        });
      } else {
        const createdConversation = await this.prisma.conversation.create({});
        await this.prisma.userConversation.createMany({
          data: [
            {
              userId,
              conversationId: createdConversation.id,
              role: 'DELIVERY',
            },
            {
              userId: secondUser.Customer.id,
              conversationId: createdConversation.id,
              role: 'CUSTOMER',
            },
          ],
        });
        conversation = await this.prisma.conversation.findUnique({
          where: {
            id: createdConversation.id,
          },
          select: {
            id: true,
            UserConversation: {
              where: {
                userId: {
                  not: userId,
                },
                role: {
                  not: 'DELIVERY',
                },
              },
              select: {
                User: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                  },
                },
              },
            },
          },
        });
      }
      return conversation;
    }
  }

  async findMessages(filters: FilterMessageDto, userId: Id) {
    const messageArgs = getMessageArgs(filters);
    const messages = await this.prisma.message.findMany({
      ...messageArgs,
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        senderId: true,
      },
    });
    await this.prisma.message.updateMany({
      where: { conversationId: filters.id, receiverId: userId },
      data: { read: true },
    });
    const total = await this.prisma.message.count({
      where: { conversationId: filters.id },
    });
    return { messages, total };
  }

  async markMessageAsUnRead(id: Id) {
    await this.prisma.message.update({
      where: {
        id,
      },
      data: {
        read: false,
      },
    });
  }
}
