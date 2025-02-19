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
import { WsAuth } from 'src/_modules/authentication/decorators/auth.decorator';
import { WsJwtGuard } from 'src/_modules/authentication/guards/ws.guard';
import { AuthenticatedSocket } from 'src/_modules/chat/interfaces/socket.interface';
import { ConnectionService } from 'src/_modules/chat/services/connection.service';
import { UpdateLocationDTO } from './dto/delivery.gateway.dto';
import { DeliveryService } from './services/delivery.service';

@WebSocketGateway(+env('SOCKET_PORT'), {
  namespace: 'location',
  cors: '*',
})
export class LocationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(LocationGateway.name);

  constructor(
    private deliveryService: DeliveryService,
    private readonly wsJwtGuard: WsJwtGuard,
    private readonly connection: ConnectionService,
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
    } catch (error) {
      this.logger.error(client, error, 'Error handling disconnection');
    }
  }

  async handleDisconnect(client: AuthenticatedSocket): Promise<void> {
    try {
      await this.connection.removeClient(client);
    } catch (error) {
      this.logger.error(client, error, 'Error handling disconnection');
    }
  }

  @WsAuth()
  @SubscribeMessage('request_locations')
  async handleRequestLocations(@ConnectedSocket() client: AuthenticatedSocket) {
    const activeDeliveryMen = await this.deliveryService.getActiveDeliveryMen();
    client.emit('active_locations', activeDeliveryMen);
  }

  @WsAuth()
  @SubscribeMessage('update_location')
  async emitLocationUpdate(
    @MessageBody() data: UpdateLocationDTO,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const updatedLocation = await this.deliveryService.updateLocation(
      client,
      data,
    );
    const activeDeliveryMen = await this.deliveryService.getActiveDeliveryMen();

    this.server.emit('location_update', updatedLocation);

    this.server.emit('active_locations', activeDeliveryMen);
    for (let i = 0; i < activeDeliveryMen.length; i++) {
      this.server.emit(
        `active_location_${activeDeliveryMen[i].id}`,
        activeDeliveryMen[i],
      );
    }
  }
}
