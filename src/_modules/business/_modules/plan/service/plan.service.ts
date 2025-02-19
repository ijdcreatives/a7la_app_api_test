import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Plan, SubscriptionStatus } from '@prisma/client';
// import { WalletService } from 'src/_modules/order/service/wallet.service';
import { firstOrMany } from 'src/globals/helpers/first-or-many';
import { localizedObject } from 'src/globals/helpers/localized.return';
import { paginateOrNot } from 'src/globals/helpers/pagination-params';
import { PrismaService } from 'src/globals/services/prisma.service';
import { CreatePlanDTO, FilterPlanDTO, UpdatePlanDTO } from '../dto/plan.dto';
import {
  getArgs,
  selectSubscriptionSelectArgs,
} from '../prisma-args/plan.prisma.args';
import { PlanHelperService } from './plan.helper.service';

@Injectable()
export class PlanService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helper: PlanHelperService,
    //back again
    // private readonly wallet: WalletService,
  ) {}
  async create(body: CreatePlanDTO) {
    await this.prisma.plan.create({
      data: {
        nameAr: body.nameAr,
        nameEn: body.nameEn,
        infoAr: body.infoAr,
        infoEn: body.infoEn,
        price: body.price,
        pos: body.pos,
        days: body.days,
        chat: body.chat,
        ordersLimited: body.ordersLimited,
        itemsLimited: body.itemsLimited,
        orders: body.orders,
        items: body.items,
      },
    });
  }

  async findSubscriberStatistics() {
    const DataGroupedBy = await this.prisma.subscription.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });
    const data = Object.values(SubscriptionStatus).map((status) => {
      const found = DataGroupedBy.find((item) => item.status === status);
      return {
        status,
        _count: found ? found._count.status : 0,
      };
    });
    const allStatusTotal = await this.prisma.subscription.count();
    data.push({
      status: 'all' as SubscriptionStatus,
      _count: allStatusTotal | 0,
    });
    return data;
  }
  async findSubscriber(filter: PaginationParams, locale: Locale) {
    const args = selectSubscriptionSelectArgs();
    const data = await this.prisma.subscription.findMany({
      ...paginateOrNot(filter, false),
      ...args,
    });
    return localizedObject(data, locale);
  }
  async update(id: Id, body: UpdatePlanDTO) {
    await this.prisma.plan.update({
      where: {
        id,
      },
      data: {
        ...body,
      },
    });
  }

  async delete(id: Id) {
    await this.prisma.zone.delete({
      where: {
        id,
      },
    });
  }
  async findAll(
    locale: Locale,
    filters: FilterPlanDTO,
    role: Role,
  ): Promise<Plan[]> {
    const args = getArgs(filters, locale, role.baseRole);
    const data = await this.prisma.plan[firstOrMany(filters?.id)]({
      ...args,
    });

    return localizedObject(data, locale) as Plan[];
  }

  async renew(id: Id, storeId: Id, locale: Locale) {
    // get the plan and store from schema
    const plan = await this.prisma.plan.findUnique({ where: { id } });
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      select: { planId: true },
    });
    // check Renew bad requests
    await this.helper.checkRenew(plan, store, id, locale);
    // renew the plan
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        storeId,
        planId: id,
      },
    });
    await this.prisma.subscription.update({
      where: {
        id: subscription.id,
      },
      data: {
        status: SubscriptionStatus.ACTIVE,
        startDate: new Date(),
        expireDate: new Date(
          new Date().setDate(new Date().getDate() + plan.days),
        ),
        renew: {
          increment: 1,
        },
      },
    });
    //back again
    // await this.wallet.BusinessSubscribeWallet(plan.price);
  }
  async subscribe(id: Id, storeId: Id, locale: Locale) {
    // get the plan and store and if it subscribed before from schema
    const plan = await this.prisma.plan.findUnique({ where: { id } });
    const isSubscribedBefore = await this.prisma.subscription.findFirst({
      where: {
        storeId,
        planId: id,
      },
    });
    // check Subscribe bad requests
    await this.helper.checkSubscribe(plan, locale);
    // prisma transaction
    await this.prisma.$transaction(async (tx) => {
      // update all other plans to inactive
      await tx.subscription.updateMany({
        where: {
          storeId,
          planId: id,
        },
        data: {
          status: SubscriptionStatus.INACTIVE,
        },
      });
      // update in renew table
      await this.helper.renewInsertion(
        isSubscribedBefore,
        tx,
        storeId,
        plan.id,
        plan.days,
      );
      // get store
      const store = await tx.store.findUnique({
        where: {
          id: storeId,
        },
      });
      // update store planId
      await tx.store.updateMany({
        where: {
          OR: [
            { id: store.mainStoreId },
            { mainStoreId: store.mainStoreId },
            { id: store.id },
            { mainStoreId: store.id },
          ],
        },
        data: {
          planId: id,
        },
      });
    });
    //back again
    // await this.wallet.BusinessSubscribeWallet(plan.price);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handlePlanExpiration() {
    await this.prisma.subscription.updateMany({
      where: {
        expireDate: {
          lte: new Date(Date.now()),
        },
      },
      data: {
        status: SubscriptionStatus.EXPIRED,
      },
    });
    const stores = await this.prisma.subscription.findMany({
      where: {
        status: SubscriptionStatus.EXPIRED,
      },
      select: {
        storeId: true,
      },
    });
    const plan = await this.prisma.plan.findFirst({
      where: {
        deletedAt: null,
        isActive: true,
        price: 0,
      },
    });
    await this.prisma.store.updateMany({
      where: {
        id: {
          in: stores.map((item) => item.storeId),
        },
      },
      data: {
        planId: plan.id,
      },
    });

    await this.prisma.subscription.updateMany({
      where: {
        expireDate: {
          lte: new Date(new Date().setDate(new Date().getDate() - 30)),
        },
      },
      data: {
        status: SubscriptionStatus.EXPIRE_SOON,
      },
    });
  }
}
