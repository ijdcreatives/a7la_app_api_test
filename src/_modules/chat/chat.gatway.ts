import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { WsAuth } from '../authentication/decorators/auth.decorator';
import { WsJwtGuard } from '../authentication/guards/ws.guard';
import { CreateMessageDto } from './dto/chat.dto';
import { AuthenticatedSocket } from './interfaces/socket.interface';
import { ChatService } from './services/chat.service';
import { ConnectionService } from './services/connection.service';

@WebSocketGateway(+env('SOCKET_PORT'), {
  namespace: 'chat',
  cors: '*',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly wsJwtGuard: WsJwtGuard,
    private readonly connection: ConnectionService,
    private readonly chatService: ChatService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    this.logger.log('Client trying to connect...');
    try {
      const canActivate = await this.wsJwtGuard.canActivate({
        switchToWs: () => ({ getClient: () => client }),
      } as any);
      if (!canActivate) {
        this.logger.warn(`Unauthorized connection attempt`);
        client.disconnect();
        return;
      }
      await this.connection.addClient(client);
      this.logger.log(`Client ${client.id} connected`);
    } catch (error) {
      this.handleError(client, error, 'Error handling connection ya fahd');
    }
  }

  async handleDisconnect(client: AuthenticatedSocket): Promise<void> {
    try {
      await this.connection.removeClient(client);
    } catch (error) {
      this.logger.log(client, error, 'Error handling disconnection');
    }
  }

  @SubscribeMessage('join_room')
  @WsAuth()
  async joinConversation(
    @MessageBody() data: { conversationId: Id },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    await this.chatService.joinConversation(data, client);

    const response = {
      roomId: `conversation_${data.conversationId}`,
      userId: client.user?.userId.toString(),
      timestamp: new Date().toISOString(),
    };
    this.server
      .to(`conversation_${data.conversationId}`)
      .emit('joined_room', response);
  }

  @SubscribeMessage('leave_room')
  @WsAuth()
  async leaveConversation(
    @MessageBody() data: { conversationId: Id },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    await this.chatService.leaveConversation(data, client);
    const response = {
      roomId: `conversation_${data.conversationId}`,
      userId: client.user?.userId.toString(),
      timestamp: new Date().toISOString(),
    };
    this.server
      .to(`conversation_${data.conversationId}`)
      .emit('left_room', response);

    this.logger.debug(
      `User ${client.user?.userId} left conversation ${data.conversationId}`,
    );
  }

  @SubscribeMessage('send_message')
  @WsAuth()
  async createMessage(
    @MessageBody() createMessageDto: CreateMessageDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const message = await this.chatService.createMessage(
      createMessageDto,
      client.user?.userId,
      client.user?.baseRole,
    );
    const roomId = `conversation_${message.conversationId}`;
    this.server.to(roomId).emit('message_delivered', message);

    await this.notifyOtherParticipants(message);

    return message;
  }

  private async notifyOtherParticipants(message: any) {
    const conversationUsers = await this.chatService.getConversationUserIds(
      message.conversationId,
    );
    const notifications = conversationUsers
      .filter((user) => user)
      .map(async (user) => {
        const userSocket = await this.connection.getClients(
          user.userId,
          user.role,
        );
        if (userSocket) {
          const isInRoom = await this.connection.isClientInRoom(
            `conversation_${message.conversationId}`,
            user.userId,
            user.role,
          );
          if (!isInRoom) {
            this.server.to(userSocket.id).emit('new_message', message);
            await this.chatService.markMessageAsUnRead(message.id);
          }
        }
      });

    await Promise.all(notifications);
  }
  //send_message
  //join_room
  private handleError(
    client: AuthenticatedSocket,
    error: any,
    context: string,
  ) {
    this.logger.error(`${context}: ${error.message}`, error.stack);
    client.emit('error', { message: 'An error occurred. Please try again.' });
  }
}
