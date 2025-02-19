import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/globals/services/prisma.service';
import { StoreNotificationSetup } from '@prisma/client';

@Injectable()
export class NotificationSetupService {
  constructor(private readonly prisma: PrismaService) {}

  async findNotificationSetup(id: Id): Promise<StoreNotificationSetup[]> {
    return this.prisma.storeNotificationSetup.findMany({
      where: { storeId: id },
    });
  }

  async updateNotificationSetup(
    notificationId: Id,
    restData: Partial<StoreNotificationSetup>,
  ) {
    await this.prisma.storeNotificationSetup.update({
      where: { id: notificationId },
      data: restData,
    });
  }
}
