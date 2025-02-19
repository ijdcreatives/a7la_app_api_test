import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CreatedBy, Prisma, Roles, StoreSchedule } from '@prisma/client';
import * as turf from '@turf/turf';
import { GuestOTPService } from 'src/_modules/authentication/_modules/otp/guest-otp.service';
import { LocaleHeader } from 'src/_modules/authentication/decorators/locale.decorator';
import { ZoneService } from 'src/_modules/business/_modules/zone/zone.service';
import { VendorService } from 'src/_modules/user/_roles/vendor/vendor.service';
import { PrismaService } from 'src/globals/services/prisma.service';
import { SettingService } from 'src/globals/services/settings.service';
import { PointDTO } from '../dto/store.dto';
import { User } from '../interface/user.interface';
import { Zone } from '../interface/zone.interface';
import { prepareStoreData } from '../prisma-args/store.prisma.args';
import {
  CreateVendorDTO,
  UpdateVendorDTO,
} from 'src/_modules/user/_roles/vendor/dto/vendor.dto';
@Injectable()
export class StoreHelperService {
  constructor(
    @Inject(forwardRef(() => GuestOTPService))
    private readonly guestOTPService: GuestOTPService,
    private readonly vendorService: VendorService,
    private readonly zoneService: ZoneService,
    private readonly prisma: PrismaService,
    private readonly setting: SettingService,
  ) {}

  async CreateStore(
    tx: Prisma.TransactionClient,
    storeData: any,
    zoneId: Id | null,
    role: Role,
    point: PointDTO,
  ) {
    const createPrismaArgs = prepareStoreData(storeData, zoneId, point);
    const store = await tx.store.create({
      data: {
        ...createPrismaArgs,
        status: role.baseRole === Roles.ADMIN ? 'ACTIVE' : 'PENDING',
      },
    });

    await this.guestOTPService.generateNewNumberOTP(store.phone, Roles.VENDOR);

    return store;
  }

  async CheckVendorExist(user: User, id?: Id) {
    await this.vendorService.isExist({
      email: user.email,
      phone: user.phone,
      id,
    });
  }

  async CreateZoneStore(
    tx: Prisma.TransactionClient,
    body?: {
      nameEn: string;
      nameAr: string;
      point: PointDTO;
    },
    zoneId?: Id,
  ) {
    let zone;
    if (body && !zoneId) {
      zone = await this.zoneService.create(
        tx,

        {
          nameAr: body.nameAr,
          nameEn: body.nameEn,
          displayDefault: body.nameEn,
          displayEn: body.nameEn,
          displayAr: body.nameAr,
          isActive: true,
          createdBy: CreatedBy.VENDOR,
          points: [{ lat: +body.point.lat, lng: +body.point.lng }],
        },
      );
    } else {
      zone = await tx.zone.findUnique({
        where: {
          id: zoneId,
        },
        select: {
          nameAr: true,
          nameEn: true,
          displayAr: true,
          displayEn: true,
          Point: true,
        },
      });
    }
    return zone;
  }

  async FindMainStore(tx: Prisma.TransactionClient, id: Id) {
    return await tx.store.findFirst({
      where: {
        id,
      },
      select: {
        nameAr: true,
        nameEn: true,
        tax: true,
        moduleId: true,
        logo: true,
        cover: true,
        verified: true,
        minDeliveryTime: true,
        maxDeliveryTime: true,
        status: true,
      },
    });
  }

  async CreateBranchVendor(
    tx: Prisma.TransactionClient,
    id: Id,
    user: User,
    roleId: Id,
  ) {
    await this.CheckVendorExist(user);
    const vendor = await this.vendorService.createVendor(tx, {
      storeId: id,
      ...user,
      role: roleId,
    });

    return vendor;
  }

  async UpdateBranchVendor(
    tx: Prisma.TransactionClient,
    id: Id,
    user: User,
    storeId: Id,
    locale: Locale,
  ) {
    await this.vendorService.updateVendorBranch(tx, id, user, storeId, locale);
  }

  static createUserObject(vendor: CreateVendorDTO | UpdateVendorDTO): User {
    return {
      name: vendor.name,
      phone: vendor.phone,
      email: vendor.email,
      password: vendor.password,
      idNumber: vendor.idNumber,
    };
  }

  static createZoneObject(branchName: string, point: PointDTO): Zone {
    return {
      nameAr: branchName,
      nameEn: branchName,
      displayAr: branchName,
      displayEn: branchName,
      point,
    };
  }
  async createWallet(tx: Prisma.TransactionClient, storeId: Id) {
    await tx.wallet.create({
      data: {
        storeId,
      },
    });
  }
  private isStoreClosed(storeSchedule: StoreSchedule[]) {
    const days = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    const currentTime = new Date();

    const currentDay = currentTime.getDay();
    // change time
    currentTime.setHours(currentTime.getHours() + 2);

    const todaySchedule = storeSchedule.filter(
      (schedule) => schedule.day === days[currentDay].toUpperCase(),
    );
    if (!todaySchedule.length) return true;

    const openingTime = new Date();
    const closingTime = new Date();
    for (const schedule of todaySchedule) {
      // const [openHour, openMinute] = schedule.openingTime
      //   .toTimeString()
      //   .split(':')
      //   .map(Number);
      // const [closeHour, closeMinute] = schedule.closingTime
      //   .toTimeString()
      //   .split(':')
      //   .map(Number);
      const openHour = schedule.openingTime
        .toISOString()
        .split(':')[0]
        .split('T')[1];
      const openMinute = schedule.openingTime.toISOString().split(':')[1];

      const closeHour = schedule.closingTime
        .toISOString()
        .split(':')[0]
        .split('T')[1];
      const closeMinute = schedule.closingTime.toISOString().split(':')[1];
      openingTime.setHours(+openHour, +openMinute);
      closingTime.setHours(+closeHour, +closeMinute);

      if (currentTime >= openingTime && currentTime <= closingTime) {
        return false;
      }
    }

    return true;
  }

  async currentZones(userLng: number, userLat: number) {
    const currentZones = [];
    const userLocation = turf.point([userLng, userLat]);
    const { storeNearestByKM } = await this.setting.getSettings([
      'storeNearestByKM',
    ]);
    const zones = await this.prisma.zone.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        Point: true,
      },
    });
    for (const zone of zones) {
      let enter = false;
      if (zone.createdBy === CreatedBy.ADMIN && zone.isActive) {
        if (zone.Point.length >= 3) {
          const currentZone = zone;
          currentZone.Point.push({
            id: currentZone.id + 1,
            zoneId: zone.id,
            lat: currentZone.Point[0].lat,
            lng: currentZone.Point[0].lng,
            deletedAt: null,
          });
          const polygon = turf.polygon([
            currentZone.Point.map((point) => [+point.lng, +point.lat]),
          ]);
          const isInside = turf.booleanPointInPolygon(userLocation, polygon);
          if (isInside) {
            enter = true;
            currentZones.push(currentZone);
          }
        }
      }
      if (!enter) {
        const storeLocation = turf.point([
          +zone.Point[0].lng,
          +zone.Point[0].lat,
        ]);
        const distance = turf.distance(userLocation, storeLocation, {
          units: 'kilometers',
        });
        if (distance <= storeNearestByKM) currentZones.push(zone);
      }
    }
    return currentZones;
  }

  async getNearestOpenStores(
    lat: number,
    lng: number,
    radiusInKm = 1000,
  ): Promise<
    [
      {
        id: number;
        lat: string;
        lng: string;
        closed: boolean;
        temporarily_closed: boolean;
        distance: number;
        name: string;
      },
    ]
  > {
    // 1970-01-01T22:10:00.000Z
    const stores = await this.prisma.$queryRawUnsafe(`
    SELECT
      s.id,
      s.nameEn,
      s.lat,
      s.lng,
      s.closed,
      s.temporarily_closed,
    
      CASE 
        WHEN s.lat IS NULL OR s.lng IS NULL THEN 0
        ELSE (6371 * ACOS(COS(RADIANS(${lat})) * COS(RADIANS(s.lat)) * COS(RADIANS(s.lng) - RADIANS(${lng})) + SIN(RADIANS(${lat})) * SIN(RADIANS(s.lat))))
      END AS distance,

    ss.opening_time AS store_opening_time,
    ss.closing_time AS store_closing_time,

    ms_schedule.opening_time AS main_store_opening_time,
    ms_schedule.closing_time AS main_store_closing_time

    FROM
      store s
    LEFT JOIN 
      store ms ON ms.id = s.main_store_id -- Join to get MainStore
    LEFT JOIN 
      store_schedule ss ON ss.store_id = s.id -- Store schedule
    LEFT JOIN 
      store_schedule ms_schedule ON ms_schedule.store_id = ms.id -- MainStore schedule
    WHERE
      s.temporarily_closed = false
      AND s.closed = false
      AND (s.lat IS NOT NULL AND s.lng IS NOT NULL)
      AND (s.main_store_id IS NOT NULL)
      HAVING
          distance <= ${radiusInKm}
    ORDER BY
      distance ASC;
`);

    // AND (
    //     ms.id IS NULL OR (
    //       ms_schedule.day = '${Days[currentDay].toUpperCase()}'
    //       AND ms_schedule.opening_time >= '${currentTime}'
    //       AND ms_schedule.closing_time >= '${currentTime}'
    //     )
    //   )
    return stores as [
      {
        id: number;
        lat: string;
        lng: string;
        closed: boolean;
        temporarily_closed: boolean;
        distance: number;
        name: string;
      },
    ];
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async checkClosedStores(storeId?: Id) {
    if (storeId) {
      const store = await this.prisma.store.findUnique({
        where: { id: storeId },
        select: {
          MainStore: {
            select: {
              StoreSchedule: true,
            },
          },
          mainStoreId: true,
          id: true,
          StoreSchedule: true,
          temporarilyClosed: true,
        },
      });
      const isClosed = this.isStoreClosed(
        store.MainStore ? store.MainStore.StoreSchedule : store.StoreSchedule,
      );

      await this.prisma.store.updateMany({
        where: {
          OR: [
            { id: store.MainStore ? store.mainStoreId : store.id },
            { mainStoreId: store.mainStoreId },
          ],
        },
        data: {
          closed: store.temporarilyClosed === false && isClosed,
        },
      });
    }
    const stores = await this.prisma.store.findMany({
      where: {
        mainStoreId: {
          not: null,
        },
      },
      select: {
        id: true,
        MainStore: {
          select: {
            StoreSchedule: true,
          },
        },
        mainStoreId: true,
        temporarilyClosed: true,
      },
    });
    for (const store of stores) {
      const isClosed = this.isStoreClosed(store.MainStore.StoreSchedule);
      await this.prisma.store.updateMany({
        where: {
          OR: [{ id: store.mainStoreId }, { mainStoreId: store.mainStoreId }],
        },
        data: {
          closed:
            store.temporarilyClosed === false && isClosed === false
              ? false
              : true,
        },
      });
    }
  }
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async deleteNotVerifiedStores() {
    await this.prisma.store.deleteMany({
      where: {
        verified: false,
        createdAt: {
          lte: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      },
    });
  }
}
