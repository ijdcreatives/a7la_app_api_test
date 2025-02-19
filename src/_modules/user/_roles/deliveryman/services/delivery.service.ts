import { BadRequestException, Injectable } from '@nestjs/common';
import { DeliveryManStatus, OrderStatus, Roles } from '@prisma/client';
import { isArray } from 'class-validator';
import { GuestOTPService } from 'src/_modules/authentication/_modules/otp/guest-otp.service';
import { userJoinedRole } from 'src/_modules/authentication/helpers/role-helper';
import { BaseAuthenticationService } from 'src/_modules/authentication/services/base.authentication.service';
import { AuthenticatedSocket } from 'src/_modules/chat/interfaces/socket.interface';
import { handelSucceededTemp } from 'src/_modules/media/helpers/handel-temp-files';
import { HandelFiles } from 'src/_modules/media/helpers/handel-types';
import { PrismaService } from 'src/globals/services/prisma.service';
import {
  CreateDeliverymanDto,
  FilterDeliverymanDTO,
  PhoneVerifyDTO,
  UpdateDeliverymanDTO,
} from '../dto/delivery.dto';
import { UpdateLocationDTO } from '../dto/delivery.gateway.dto';
import {
  getArgs,
  getDeliveryArgsWithSelect,
} from '../prisma-args/delivery.prisma.args';
import { DeliveryHelper } from './helper.service';

@Injectable()
export class DeliveryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: BaseAuthenticationService,
    private readonly guestOTPService: GuestOTPService,
    private readonly helper: DeliveryHelper,
  ) {}

  generatePaths(
    files: UploadedFiles,
    body: CreateDeliverymanDto | UpdateDeliverymanDTO,
  ) {
    const pathData: Partial<{
      image: UploadedFile;
      identifyImage: UploadedFile;
    }> = {};
    if (files['image']?.[0]) pathData.image = files['image'][0];
    if (files['identifyImage']?.[0])
      pathData.identifyImage = files['identifyImage'][0];
    HandelFiles.generatePath<
      Partial<{ image: UploadedFile; identifyImage: UploadedFile }>,
      CreateDeliverymanDto | UpdateDeliverymanDTO
    >(pathData, body, body.firstName ? body.firstName + body.lastName : 'Edit');
  }

  async verifyDelivery(body: PhoneVerifyDTO, locale: Locale) {
    const { id, phone, otp } = body;
    const model = userJoinedRole(Roles.DELIVERY);
    const user = await this.prisma[model].findUnique({
      where: { phone, id },
      select: { Delivery: true },
    });
    if (!user) throw new BadRequestException('auth.invalidOtp');
    await this.guestOTPService.verifyNewPhoneAndReturnToken(phone, otp, locale);
    await this.prisma.delivery.update({
      where: {
        id,
      },
      data: {
        verified: true,
      },
    });
    await this.prisma.wallet.create({
      data: {
        deliveryManId: user.Delivery.id,
      },
    });
  }

  async updateDelivery(
    body: WithId<UpdateDeliverymanDTO>,
    files: UploadedFile[],
  ) {
    const { id, readyToReceiveOrders, ...rest } = body;
    if (files) {
      this.generatePaths(files, rest);
    }
    await this.prisma.delivery.update({
      where: { id },
      data: {
        readyToReceiveOrders,
      },
    });
    if (files) {
      handelSucceededTemp(files, 'Edit');
    }
  }

  async getDeliveryStatistics(filters: FilterDeliverymanDTO) {
    const data = await this.helper.getTotalOrders(filters);

    return data;
  }

  async getFinancial(id: Id) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { deliveryManId: id },
      select: {
        currentBalance: true,
      },
    });
    const { start: startWeak } = this.helper.getLastWeekRange();
    const { start: startMonth } = this.helper.getLastMonthRange();
    const weakEarning = await this.prisma.order.aggregate({
      where: {
        createdAt: {
          gte: startWeak,
        },
        deliveryManId: id,
        status: OrderStatus.DELIVERED,
      },
      _sum: {
        deliveryCommission: true,
      },
    });
    const monthEarning = await this.prisma.order.aggregate({
      where: {
        createdAt: {
          gte: startMonth,
        },
        deliveryManId: id,
        status: OrderStatus.DELIVERED,
      },
      _sum: {
        deliveryCommission: true,
      },
    });
    return {
      currentBalance: wallet.currentBalance,
      weakEarning: weakEarning._sum.deliveryCommission || 0,
      monthEarning: monthEarning._sum.deliveryCommission || 0,
    };
  }

  async findWallet(deliveryManId: Id) {
    const data = await this.prisma.wallet.findUnique({
      where: {
        deliveryManId,
      },
    });
    return data;
  }

  async getDeliveryDispatch() {
    const readyDelivery = await this.prisma.delivery.count({
      where: {
        readyToReceiveOrders: true,
        status: DeliveryManStatus.ACTIVE,
      },
    });
    const activeDelivery = await this.prisma.delivery.count({
      where: {
        status: DeliveryManStatus.ACTIVE,
      },
    });

    const deniedDelivery = await this.prisma.delivery.count({
      where: {
        status: DeliveryManStatus.DENIED,
      },
    });
    const orderStatistics = await this.prisma.order.groupBy({
      by: ['status'],
      _count: true,
    });
    const pendingOrders = orderStatistics.find(
      (item) => item.status === OrderStatus.PENDING,
    );
    const assignedOrders = orderStatistics.find(
      (item) =>
        item.status === OrderStatus.ON_THE_WAY ||
        item.status === OrderStatus.WAITING_DELIVERY,
    );
    return {
      readyDelivery,
      activeDelivery,
      deniedDelivery,
      pendingOrders: pendingOrders?._count || 0,
      assignedOrders: assignedOrders?._count || 0,
    };
  }

  async updateLocation(
    client: AuthenticatedSocket,
    updateDto: UpdateLocationDTO,
  ) {
    const { lat, lng } = updateDto;
    return this.prisma.delivery.update({
      where: { id: client.user?.userId },
      data: {
        lat,
        lng,
      },
    });
  }

  async getActiveDeliveryMen() {
    return this.prisma.delivery.findMany({
      where: { deletedAt: null, readyToReceiveOrders: true, online: true },
      select: {
        id: true,
        lat: true,
        lng: true,
        _count: { select: { Orders: true } },
        User: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  async getAll(filters: FilterDeliverymanDTO) {
    const whereArgs = getArgs(filters);
    const selectArgs = getDeliveryArgsWithSelect();
    let data = await this.prisma.delivery.findMany({
      ...whereArgs,
      ...selectArgs,
    });

    if (!isArray(data)) data = data[0];

    const total = await this.prisma.delivery.count({
      where: whereArgs.where,
    });
    return { data, total };
  }
}

//
