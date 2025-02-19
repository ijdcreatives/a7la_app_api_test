import { Injectable } from '@nestjs/common';
import { Roles } from '@prisma/client';
import { Socket } from 'socket.io';
import { PrismaService } from 'src/globals/services/prisma.service';
import { AuthenticatedSocket } from '../interfaces/socket.interface';

@Injectable()
export class ConnectionService {
  private clients: Map<string, Socket> = new Map();

  constructor(private prisma: PrismaService) {}

  async addClient(client: AuthenticatedSocket) {
    const delivery = await this.prisma.delivery.findUnique({
      where: {
        id: client.user.userId,
      },
    });
    if (delivery) {
      await this.prisma.delivery.update({
        where: {
          id: client.user.userId,
        },
        data: {
          online: true,
        },
      });
    }
    this.clients.set(client.id, client);
  }

  async removeClient(client: AuthenticatedSocket) {
    const delivery = await this.prisma.delivery.findUnique({
      where: {
        id: client.user.userId,
      },
    });
    if (delivery) {
      await this.prisma.delivery.update({
        where: {
          id: client.user.userId,
        },
        data: {
          online: false,
        },
      });
    }
    await this.prisma.sessions.updateMany({
      where: {
        socketId: client.id,
      },
      data: {
        socketId: undefined,
      },
    });

    this.clients.delete(client.id);
  }

  async getClients(userId: Id, role: Roles) {
    const session = await this.prisma.sessions.findFirst({
      where: {
        userId: userId,
        baseRole: role,
        socketId: { not: null },
      },
    });

    if (!session?.socketId) return null;
    return this.clients.get(session.socketId);
  }

  broadcast(event: string, message: any) {
    this.clients.forEach((client) => {
      client.emit(event, message);
    });
  }

  async isClientInRoom(
    roomId: string,
    userId: Id,
    role: Roles,
  ): Promise<boolean> {
    // First check if user has access to this conversation

    // Get the user's socket if they're connected
    const sockets = await this.prisma.sessions.findMany({
      where: {
        userId,
        baseRole: role,
      },
    });

    // Check if any of the user's sockets are in the room
    for (const session of sockets) {
      if (session.socketId) {
        const socket = await this.getClients(userId, role);
        if (socket && socket.rooms.has(roomId)) {
          return true;
        }
      }
    }

    return false;
  }
}
