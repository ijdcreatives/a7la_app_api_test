import { Module } from '@nestjs/common';
import { WsJwtGuard } from '../authentication/guards/ws.guard';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gatway';
import { ChatService } from './services/chat.service';
import { ConnectionService } from './services/connection.service';

@Module({
  imports: [],
  controllers: [ChatController],
  providers: [
    ChatService,
    ChatGateway,
    WsJwtGuard,
    // UserService,
    ConnectionService,
    // ChatRedisService,
  ],
  exports: [ChatService],
})
export class ChatModule {}
