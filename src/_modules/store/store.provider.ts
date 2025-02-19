import { Injectable } from '@nestjs/common';
import { NotificationSetupStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/globals/services/prisma.service';

@Injectable()
export class StoreProvider {
  constructor(private readonly prisma: PrismaService) {}

  async syncMNotificationSetup(tx: Prisma.TransactionClient, storeId: Id) {
    for (const notification of NotificationSetup) {
      await tx.storeNotificationSetup.create({
        data: {
          name: notification.name,
          description: notification.description,
          pushEnabled: notification.pushEnabled,
          emailEnabled: notification.emailEnabled,
          smsEnabled: notification.smsEnabled,
          storeId,
        },
      });
    }
  }
  //
}

const NotificationSetup = [
  {
    name: 'Account block',
    description: 'Get notification on account block',
    pushEnabled: NotificationSetupStatus.ACTIVE,
    emailEnabled: NotificationSetupStatus.ACTIVE,
    smsEnabled: NotificationSetupStatus.DISABLED,
  },
  {
    name: 'Account unblock',
    description: 'Get notification on account unblock',
    pushEnabled: NotificationSetupStatus.ACTIVE,
    emailEnabled: NotificationSetupStatus.ACTIVE,
    smsEnabled: NotificationSetupStatus.DISABLED,
  },
  {
    name: 'Withdraw approve',
    description: 'Get notification on withdraw approve',
    pushEnabled: NotificationSetupStatus.ACTIVE,
    emailEnabled: NotificationSetupStatus.ACTIVE,
    smsEnabled: NotificationSetupStatus.DISABLED,
  },
  {
    name: 'Withdraw rejection',
    description: 'Get notification on withdraw rejection',
    pushEnabled: NotificationSetupStatus.ACTIVE,
    emailEnabled: NotificationSetupStatus.ACTIVE,
    smsEnabled: NotificationSetupStatus.DISABLED,
  },
  {
    name: 'Campaign join request',
    description: 'Get notification on campaign join request',
    pushEnabled: NotificationSetupStatus.DISABLED,
    emailEnabled: NotificationSetupStatus.ACTIVE,
    smsEnabled: NotificationSetupStatus.DISABLED,
  },
  {
    name: 'Campaign join rejection',
    description: 'Get notification on campaign join rejection',
    pushEnabled: NotificationSetupStatus.ACTIVE,
    emailEnabled: NotificationSetupStatus.ACTIVE,
    smsEnabled: NotificationSetupStatus.DISABLED,
  },
  {
    name: 'Campaign join approval',
    description: 'Get notification on campaign join approval',
    pushEnabled: NotificationSetupStatus.ACTIVE,
    emailEnabled: NotificationSetupStatus.ACTIVE,
    smsEnabled: NotificationSetupStatus.DISABLED,
  },

  {
    name: 'Order notification',
    description: 'Get notification on order notification',
    pushEnabled: NotificationSetupStatus.ACTIVE,
    emailEnabled: NotificationSetupStatus.DISABLED,
    smsEnabled: NotificationSetupStatus.DISABLED,
  },
  {
    name: 'Advertisement create by admin',
    description: 'Get notification on advertisement create by admin',
    pushEnabled: NotificationSetupStatus.ACTIVE,
    emailEnabled: NotificationSetupStatus.ACTIVE,
    smsEnabled: NotificationSetupStatus.DISABLED,
  },
  {
    name: 'Advertisement approval',
    description: 'Get notification on advertisement approval',
    pushEnabled: NotificationSetupStatus.ACTIVE,
    emailEnabled: NotificationSetupStatus.ACTIVE,
    smsEnabled: NotificationSetupStatus.DISABLED,
  },
  {
    name: 'Advertisement deny',
    description: 'Get notification on advertisement deny',
    pushEnabled: NotificationSetupStatus.ACTIVE,
    emailEnabled: NotificationSetupStatus.ACTIVE,
    smsEnabled: NotificationSetupStatus.DISABLED,
  },
  {
    name: 'Advertisement resume',
    description: 'Get notification on advertisement resume',
    pushEnabled: NotificationSetupStatus.ACTIVE,
    emailEnabled: NotificationSetupStatus.ACTIVE,
    smsEnabled: NotificationSetupStatus.DISABLED,
  },
  {
    name: 'Advertisement pause',
    description: 'Get notification on advertisement pause',
    pushEnabled: NotificationSetupStatus.ACTIVE,
    emailEnabled: NotificationSetupStatus.ACTIVE,
    smsEnabled: NotificationSetupStatus.DISABLED,
  },
  {
    name: 'Product approve',
    description: 'Get notification on product approve',
    pushEnabled: NotificationSetupStatus.ACTIVE,
    emailEnabled: NotificationSetupStatus.ACTIVE,
    smsEnabled: NotificationSetupStatus.DISABLED,
  },
  {
    name: 'Product reject',
    description: 'Get notification on product reject',
    pushEnabled: NotificationSetupStatus.ACTIVE,
    emailEnabled: NotificationSetupStatus.ACTIVE,
    smsEnabled: NotificationSetupStatus.DISABLED,
  },
  {
    name: 'Subscription success',
    description: 'Get notification on subscription success',
    pushEnabled: NotificationSetupStatus.ACTIVE,
    emailEnabled: NotificationSetupStatus.ACTIVE,
    smsEnabled: NotificationSetupStatus.DISABLED,
  },
  {
    name: 'Subscription renew',
    description: 'Get notification on subscription renew',
    pushEnabled: NotificationSetupStatus.ACTIVE,
    emailEnabled: NotificationSetupStatus.ACTIVE,
    smsEnabled: NotificationSetupStatus.DISABLED,
  },
  {
    name: 'Subscription shift',
    description: 'Get notification on subscription shift',
    pushEnabled: NotificationSetupStatus.ACTIVE,
    emailEnabled: NotificationSetupStatus.ACTIVE,
    smsEnabled: NotificationSetupStatus.DISABLED,
  },
  {
    name: 'Subscription cancel',
    description: 'Get notification on subscription cancel',
    pushEnabled: NotificationSetupStatus.ACTIVE,
    emailEnabled: NotificationSetupStatus.ACTIVE,
    smsEnabled: NotificationSetupStatus.DISABLED,
  },
  {
    name: 'Subscription plan update',
    description: 'Get notification on subscription plan update',
    pushEnabled: NotificationSetupStatus.DISABLED,
    emailEnabled: NotificationSetupStatus.ACTIVE,
    smsEnabled: NotificationSetupStatus.DISABLED,
  },
];
