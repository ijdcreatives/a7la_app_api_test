import { Roles } from '@prisma/client';

export interface UserConversation {
  userId: Id;
  conversationId: Id;
  role: Roles;
}
