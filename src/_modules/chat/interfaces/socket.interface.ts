import { Roles } from '@prisma/client';
import { Socket } from 'socket.io';

export interface AuthenticatedSocket extends Socket {
  user?: { userId: number; socketId: string; baseRole: Roles };
}
