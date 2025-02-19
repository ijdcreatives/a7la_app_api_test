import { Module } from '@nestjs/common';
import { PrismaService } from 'src/globals/services/prisma.service';
import { NotificationSetupController } from './notification-setup.controller';
import { NotificationSetupService } from './notification-setup.service';

@Module({
  imports: [],
  controllers: [NotificationSetupController],
  providers: [PrismaService, NotificationSetupService],
  exports: [NotificationSetupService],
})
export class NotificationSetupModule {}
