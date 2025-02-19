import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/globals/services/prisma.service';
import { StoreNotificationSetup, StoreSchedule } from '@prisma/client';
import { CreateScheduleDTO } from './dto/schedule.dto';
import { ResponseService } from 'src/globals/services/response.service';

// Schedule service error messages
const SCHEDULE_ERRORS = {
  NAME_EXISTS: 'Schedule name already exists',
  INVALID_TIME_FORMAT: 'Invalid time format. Please use HH:mm format',
  SCHEDULE_NOT_FOUND: 'Schedule not found',
  STORE_NOT_FOUND: 'Store not found',
  INVALID_SCHEDULE: 'Invalid schedule. Closing time must be after opening time',
  OVERLAPPING_SCHEDULE: 'time is overlapping with another schedule',
} as const;

@Injectable()
export class ScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  async deleteSchedule(id: Id): Promise<void> {
    await this.prisma.storeSchedule.delete({
      where: {
        id,
      },
    });
  }

  /**
   * Creates a new store schedule
   * @param storeId Store ID
   * @param body Schedule creation data
   * @throws BadRequestException if time format is invalid
   * @throws NotFoundException if store doesn't exist
   */
  async createSchedule(
    storeId: Id,
    body: CreateScheduleDTO,
    locale: Locale,
  ): Promise<StoreSchedule> {
    const { openingTime, closingTime, ...restOfBody } = body;

    // Validate store exists
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });
    if (!store) {
      throw new NotFoundException(SCHEDULE_ERRORS.STORE_NOT_FOUND);
    }

    const today = new Date().toISOString().split('T')[0];
    const openDateTime = new Date(`${today}T${openingTime}:00`);
    const closeDateTime = new Date(`${today}T${closingTime}:00`);

    // Validate closing time is after opening time
    if (closeDateTime <= openDateTime) {
      throw new BadRequestException(SCHEDULE_ERRORS.INVALID_SCHEDULE);
    }

    await this.scheduleExist(storeId, body, locale);

    return this.prisma.storeSchedule.create({
      data: {
        storeId: store.mainStoreId,
        openingTime: openDateTime,
        closingTime: closeDateTime,
        ...restOfBody,
      },
    });
  }

  async scheduleExist(
    storeId: Id,
    body: CreateScheduleDTO,
    locale: Locale,
  ): Promise<void> {
    const mainStore = await this.prisma.store.findUnique({
      where: { id: storeId },
    });

    if (body.closingTime <= body.openingTime) {
      throw new BadRequestException(SCHEDULE_ERRORS.INVALID_SCHEDULE);
    }
    const today = new Date().toISOString().split('T')[0]; // "2024-11-28"
    const dateTimeString = `${today}T${body.openingTime}:00`; // Add seconds to the time string

    const dateWithTime = new Date(dateTimeString);

    const exist = await this.prisma.storeSchedule.findFirst({
      where: {
        storeId: mainStore.mainStoreId,
        day: body.day,
        closingTime: { gte: dateWithTime },
      },
    });
    if (exist) {
      throw new BadRequestException(SCHEDULE_ERRORS.OVERLAPPING_SCHEDULE);
    }
  }
}
