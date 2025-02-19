import { Module } from '@nestjs/common';
import { GuestOTPService } from 'src/_modules/authentication/_modules/otp/guest-otp.service';
import { WsJwtGuard } from 'src/_modules/authentication/guards/ws.guard';
import { BaseAuthenticationService } from 'src/_modules/authentication/services/base.authentication.service';
import { TokenService } from 'src/_modules/authentication/services/jwt.service';
import { ConnectionService } from 'src/_modules/chat/services/connection.service';
import { UserService } from '../../user.service';
import { DeliveryController } from './delivery.controller';
import { LocationGateway } from './location.gateway';
import { DeliveryService } from './services/delivery.service';
import { DeliveryHelper } from './services/helper.service';

@Module({
  imports: [],
  controllers: [DeliveryController],
  providers: [
    DeliveryService,
    BaseAuthenticationService,
    TokenService,
    UserService,
    WsJwtGuard,
    ConnectionService,
    DeliveryHelper,
    LocationGateway,
    GuestOTPService,
  ],
  exports: [DeliveryService],
})
export class DeliveryModule {}
