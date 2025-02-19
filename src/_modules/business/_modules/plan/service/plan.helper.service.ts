import { BadRequestException, Injectable } from '@nestjs/common';
import { Plan, Prisma, Subscription, SubscriptionStatus } from '@prisma/client';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class PlanHelperService {
  constructor(private readonly i18n: I18nService) {}

  // check renew function to check if the user can renew
  async checkRenew(
    plan: Plan,
    store: { planId: Id },
    givenPlanId: Id,
    locale: Locale,
  ) {
    if (plan.price === 0)
      throw new BadRequestException(
        this.i18n.translate('you_can_t_renew_to_this_plan', {
          lang: locale,
        }),
      );
    if (store.planId !== givenPlanId)
      throw new BadRequestException(
        this.i18n.translate('you_can_t_renew_this_plan', {
          lang: locale,
        }),
      );
  }

  // check subscribe function to check if the user can subscribe
  async checkSubscribe(plan: Plan, locale: Locale) {
    if (plan.price === 0)
      throw new BadRequestException(
        this.i18n.translate('you_can_t_subscribe_to_this_plan', {
          lang: locale,
        }),
      );
  }

  // function to create new subscribe for the new plan
  async renewIfNotFound(
    prisma: Prisma.TransactionClient,
    days: number,
    storeId: Id,
    planId: Id,
  ) {
    await prisma.subscription.create({
      data: {
        status: SubscriptionStatus.ACTIVE,
        startDate: new Date(),
        expireDate: new Date(new Date().setDate(new Date().getDate() + days)),
        renew: 1,
        storeId,
        planId,
      },
    });
  }
  // function to update the renew column in the plan already exist
  async renewIfAlreadyExist(
    prisma: Prisma.TransactionClient,
    days: number,
    isSubscribedBefore: Subscription | null,
  ) {
    await prisma.subscription.update({
      where: {
        id: isSubscribedBefore.id,
      },
      data: {
        status: SubscriptionStatus.ACTIVE,
        startDate: new Date(),
        expireDate: new Date(new Date().setDate(new Date().getDate() + days)),
        renew: {
          increment: 1,
        },
      },
    });
  }
  // function to check if the user already have a subscription
  async renewInsertion(
    isSubscribedBefore: Subscription | null,
    prisma: Prisma.TransactionClient,
    storeId: Id,
    planId: Id,
    days: number,
  ) {
    if (!isSubscribedBefore)
      this.renewIfNotFound(prisma, days, storeId, planId);
    else this.renewIfAlreadyExist(prisma, days, isSubscribedBefore);
  }
}
