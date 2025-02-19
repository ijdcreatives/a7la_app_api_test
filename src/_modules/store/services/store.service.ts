import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { HandelFiles } from 'src/_modules/media/helpers/handel-types';
import { PrismaService } from 'src/globals/services/prisma.service';

import {
  CreatedBy,
  Roles,
  Store,
  StoreNotificationSetup,
  StoreSchedule,
  StoreStatus,
} from '@prisma/client';
import * as turf from '@turf/turf';
import { I18nService } from 'nestjs-i18n';
import { GuestOTPService } from 'src/_modules/authentication/_modules/otp/guest-otp.service';
import { VendorService } from 'src/_modules/user/_roles/vendor/vendor.service';
import { calculateDistance } from 'src/globals/helpers/calculateDistance.helper';
import { firstOrMany } from 'src/globals/helpers/first-or-many';
import { localizedObject } from 'src/globals/helpers/localized.return';
import { SettingService } from 'src/globals/services/settings.service';
import { handelSucceededTemp } from '../../media/helpers/handel-temp-files';
import { BranchService } from '../_modules/branch/branch.service';
import { FilterStoreStatisticsDTO } from '../dto/statistics.dto';
import {
  CreateStoreDTO,
  FilterNearestDTO,
  FilterStoreDTO,
  SwitchPlanDTO,
  UpdateStoreDTO,
} from '../dto/store.dto';
import { PhoneVerifyDTO } from '../dto/verify.dto';
import { User } from '../interface/user.interface';
import { Zone } from '../interface/zone.interface';
import {
  getArgs,
  getArgsWithSelect,
  prepareUpdateStoreData,
} from '../prisma-args/store.prisma.args';
import { StoreHelperService } from './helper.service';

// Store service error messages
const STORE_ERRORS = {
  NAME_EXISTS: 'Store name already exists',
  INVALID_TIME_FORMAT: 'Invalid time format. Please use HH:mm format',
  STORE_NOT_FOUND: 'Store not found',
  INVALID_SCHEDULE: 'Invalid schedule. Closing time must be after opening time',
} as const;

@Injectable()
export class StoreService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helper: StoreHelperService,
    private readonly branchService: BranchService,
    private readonly settingService: SettingService,
    private readonly guestOTPService: GuestOTPService,
  ) {}

  /**
   * Creates a new store with associated vendor
   * @param user User information for vendor creation
   * @param body Store creation data
   * @param files Optional uploaded files for store
   * @throws BadRequestException if input validation fails
   * @throws ConflictException if store name already exists
   */
  async create(
    user: User,
    zoneBody: Zone,
    body: CreateStoreDTO,
    locale: Locale,
    role: Role,
    files?: UploadedFile[],
  ): Promise<any> {
    const { point, ...storeData } = body;
    // Step 1: Create branch and zone
    if (!point && !body.zoneId) {
      throw new BadRequestException('Either point or zoneId must be provided');
    }
    // Step 1: Generate file paths
    const store = await this.prisma.$transaction(async (tx) => {
      this.generateFilePaths(files, storeData);

      await this.helper.CheckVendorExist(user);
      const store = await this.helper.CreateStore(
        tx,
        storeData,
        null,
        role,
        body.point,
      );
      // Step 3: Create Main Branch
      const branchName =
        locale.toLowerCase() !== 'ar' ? 'Main Branch' : 'الفرع الرئيسي';
      await this.branchService.createBranch(
        tx,
        user,
        zoneBody,
        {
          address: body.address,
          branchName,
          phone: body.phone,
          cityId: body.cityId,
          default: true,
          point: body.point,
        },
        store.id,
        true,
        locale,
        body.zoneId,
      );
      // Step 4: change the file paths

      handelSucceededTemp(files, store.nameEn);
      return store;
    });
    return store;
  }

  async verifyStore(body: PhoneVerifyDTO, locale: Locale) {
    const { id, phone, otp } = body;
    let mainStore;
    const store = await this.prisma.store.findUnique({ where: { phone, id } });
    if (!store) throw new BadRequestException('invalid OTP');
    await this.guestOTPService.verifyNewPhoneAndReturnToken(phone, otp, locale);
    if (store.mainStoreId) {
      mainStore = await this.prisma.store.findUnique({
        where: { id: store.mainStoreId },
      });
    } else {
      mainStore = store;
    }
    await this.prisma.store.update({
      where: { id: mainStore.id },
      data: { verified: true },
    });
    await this.prisma.store.updateMany({
      where: {
        mainStoreId: mainStore.id,
      },
      data: { verified: true },
    });
  }

  /**
   * Checks if store name already exists
   * @param nameAr Arabic store name
   * @param nameEn English store name
   * @param icon Optional store icon path
   * @param cover Optional store cover path
   * @throws ConflictException if store name exists
   */
  async checkName(
    nameAr: string,
    nameEn: string,
    icon?: string,
    cover?: string,
  ): Promise<void> {
    const exist = await this.prisma.store.findFirst({
      where: {
        OR: [{ nameAr: { equals: nameAr } }, { nameEn: { equals: nameEn } }],
      },
    });

    if (exist) {
      // Clean up uploaded files if name exists
      if (icon) HandelFiles.deleteFile(icon);
      if (cover) HandelFiles.deleteFile(cover);

      throw new ConflictException(STORE_ERRORS.NAME_EXISTS);
    }
  }

  async findAll(
    locale: Locale,
    filters: FilterStoreDTO,
    role: Roles,
    currentUser: CurrentUser,
  ) {
    if (role === Roles.CUSTOMER) {
      this.validateDto(filters);
    }
    const currentZones =
      role === Roles.CUSTOMER
        ? await this.helper.currentZones(+filters.lng, +filters.lat)
        : undefined;

    const args = getArgs(filters, locale, role, currentUser, currentZones);
    const argsWithSelect = getArgsWithSelect(filters, role, currentUser.id);
    const { shippingKMCharge, shippingMinimumCharge } =
      await this.settingService.getSettings([
        'shippingKMCharge',
        'shippingMinimumCharge',
      ]);

    let data;

    data = await this.prisma.store[firstOrMany(filters?.id)]({
      ...argsWithSelect,
      ...args,
    });

    const total = await this.prisma.store.count({
      where: {
        ...args.where,
      },
    });

    if (role === Roles.CUSTOMER) {
      if (!data) {
        throw new NotFoundException('NOT_FOUND');
      }
      data = await this.harvestDistanceAndTime(
        filters.id ? [data] : data,
        filters,
        +shippingMinimumCharge,
        +shippingKMCharge,
        currentUser.id,
        filters.id ? true : false,
      );

      if (filters.id) {
        if (Array.isArray(data)) {
          data = data[0];
        }
        let isInside = false;
        const userLocation = turf.point([filters.lng, filters.lat]);
        const zone = await this.prisma.zone.findUnique({
          where: {
            id: data.zoneId,
          },
          include: {
            Point: true,
          },
        });
        if (
          zone.isActive &&
          zone.deletedAt !== null &&
          zone.createdBy === CreatedBy.ADMIN &&
          zone.Point.length >= 3
        ) {
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
          isInside = turf.booleanPointInPolygon(userLocation, polygon);
          data.homeDelivery = isInside;
        }
      }
      if (!filters.id && filters.orderBy && filters.orderBy.length === 1)
        data.sort((a, b) => a.distance - b.distance);
    }

    if (filters.id) {
      data['StoreSchedule'] = data.MainStore
        ? data?.MainStore?.StoreSchedule
        : data.StoreSchedule;
      if (data.MainStore) {
        delete data?.MainStore?.StoreSchedule;
      }
    }

    return {
      stores: localizedObject(data, locale, [
        'metaTitleAr',
        'nameEn',
        'nameAr',
        'addressAr',
        'addressEn',
        'metaTitleEn',
        'metaDescriptionEn',
        'metaDescriptionAr',
      ]),
      total,
    };
  }

  async storesCount(filters?: FilterStoreStatisticsDTO): Promise<{
    allStores: number;
    activeStores: number;
    pendingStores: number;
  }> {
    const allStores = await this.prisma.store.count({
      where: {
        deletedAt: null,
        mainStoreId: null,
        ...(filters.moduleId ? { moduleId: filters.moduleId } : {}),
      },
    });
    const activeStores = await this.prisma.store.count({
      where: {
        status: StoreStatus.ACTIVE,
        deletedAt: null,
        mainStoreId: null,
        ...(filters.moduleId ? { moduleId: filters.moduleId } : {}),
      },
    });
    const pendingStores = await this.prisma.store.count({
      where: {
        status: StoreStatus.PENDING,
        deletedAt: null,
        mainStoreId: null,
        ...(filters.moduleId ? { moduleId: filters.moduleId } : {}),
      },
    });

    return {
      allStores,
      activeStores,
      pendingStores,
    };
  }

  async updateStore(
    body: UpdateStoreDTO,
    id: Id,
    files?: UploadedFile[],
  ): Promise<Store> {
    if (files) {
      this.generateFilePaths(files, body);
    }
    const updateStoreArgs = prepareUpdateStoreData(body);
    await this.prisma.store.update({
      where: { id },
      data: updateStoreArgs,
    });
    const updatedStore = await this.prisma.store.findUnique({
      where: {
        id,
      },
    });
    const {
      nameAr,
      nameEn,
      logo,
      cover,
      planId,
      maxDeliveryTime,
      minDeliveryTime,
      deliveryTime,
      isRecommended,
      homeDelivery,
      takeAway,
      carDelivery,
      minimumOrderAmount,
    } = updatedStore;
    await this.prisma.store.updateMany({
      where: {
        OR: [
          { mainStoreId: updatedStore.id },
          { id: updatedStore.id },
          { mainStoreId: updatedStore?.mainStoreId | updatedStore.id },
          { id: updatedStore?.mainStoreId | updatedStore.id },
        ],
      },
      data: {
        nameAr,
        nameEn,
        logo,
        cover,
        planId,
        maxDeliveryTime,
        minDeliveryTime,
        deliveryTime,
        isRecommended,
        homeDelivery,
        takeAway,
        carDelivery,
        status: body.status,
        minimumOrderAmount,
      },
    });

    if (files) {
      handelSucceededTemp(files, 'Edited');
    }
    return updatedStore;
  }

  async deleteStore(id: Id): Promise<void> {
    await this.prisma.store.delete({
      where: {
        id,
      },
    });
  }

  async validateUnique(
    body: any,
    locale: Locale,
    storeId?: Id,
  ): Promise<Store> {
    const exist = await this.prisma.store.findFirst({
      where: {
        OR: [{ nameAr: body.nameAr }, { nameEn: body.nameEn }],
        deletedAt: null,
      },
    });
    if ((body.nameAr || body.nameEn) && exist) {
      if (!storeId) {
        throw new ConflictException('EXIST');
      } else if (storeId !== exist.id) {
        throw new ConflictException('EXIST');
      }
    }
    body = body as CreateStoreDTO | UpdateStoreDTO;
    return exist;
  }

  private generateFilePaths(
    files: UploadedFile[],
    body: Omit<CreateStoreDTO, 'point'> | UpdateStoreDTO,
  ) {
    const fileData: { logo?: UploadedFile; cover?: UploadedFile } = {};

    if (files['logo']?.length > 0) {
      fileData.logo = files['logo'][0];
    }

    if (files['cover']?.length > 0) {
      fileData.cover = files['cover'][0];
    }

    HandelFiles.generatePath<
      { logo?: UploadedFile; cover?: UploadedFile },
      Omit<CreateStoreDTO, 'point'> | UpdateStoreDTO
    >(fileData, body, body.nameEn ?? 'Edited');
  }

  private validateDto(dto: FilterStoreDTO | FilterNearestDTO): void {
    const { lat, lng } = dto;
    if (!lat || !lng) {
      throw new BadRequestException('lat_and_lng_required');
    }
  }

  async findAllNearest(locale: Locale, filters: FilterNearestDTO) {
    await this.helper.checkClosedStores();
    this.validateDto(filters);
    const nearestStores = await this.helper.getNearestOpenStores(
      filters.lat,
      filters.lng,
      filters.radiusLimit,
    );

    const stores = await this.prisma.store.findMany({
      where: {
        id: {
          in: nearestStores.map((store) => store.id),
        },
      },
      select: {
        id: true,
        lat: true,
        lng: true,
        deliveryTime: true,
        rating: true,
        closed: true,
        logo: true,
        cover: true,
        nameAr: true,
        nameEn: true,
        moduleId: true,
        status: true,
        MainStore: {
          select: {
            StoreSchedule: true,
          },
        },
      },
    });

    return localizedObject(stores, locale);
  }

  private async harvestDistanceAndTime(
    stores: Store[],
    filters: FilterStoreDTO,
    shippingMinimumCharge: number,
    shippingKMCharge: number,
    customerId: Id,
    FindOne: boolean,
  ) {
    const { lng, lat } = filters;
    const { storeNearestByKM } = await this.settingService.getSettings([
      'storeNearestByKM',
    ]);

    const filteredStores = [];
    for (const store of stores) {
      await this.storeCoupons(store, customerId, store.zoneId);
      let distance = Infinity;
      for (const point of store['Zone']['Point']) {
        distance = Math.min(
          distance,
          calculateDistance(lat, lng, point.lat, point.lng),
        );
      }
      delete store['Zone'];
      store['distance'] = +distance.toFixed();
      store['shippingCharge'] = +Math.max(
        +shippingMinimumCharge,
        +shippingKMCharge * (distance / 1000),
      ).toFixed();
      if (FindOne || distance / 1000 <= +storeNearestByKM) {
        filteredStores.push(store);
      }
    }
    // return stores;
    return filteredStores;
  }

  async SwitchPlanDTO(storeId: Id, body: SwitchPlanDTO) {
    const store = await this.prisma.store.findUnique({
      where: {
        id: storeId,
      },
    });
    await this.prisma.store.updateMany({
      where: {
        OR: [{ id: store.mainStoreId }, { mainStoreId: store.mainStoreId }],
      },
      data: {
        planId: body.planId,
      },
    });
  }
  async favoriteStore(storeId: Id, customerId: Id) {
    // Check if the favorite already exists
    const existingFavorite = await this.prisma.favoriteStore.findUnique({
      where: {
        storeId_customerId: {
          storeId,
          customerId,
        },
      },
    });

    if (existingFavorite) {
      // If the favorite store exists, delete it
      await this.prisma.favoriteStore.delete({
        where: {
          storeId_customerId: {
            storeId,
            customerId,
          },
        },
      });
    } else {
      // If it doesn't exist, create it
      await this.prisma.favoriteStore.create({
        data: {
          storeId, // Assuming the model has a storeId field
          customerId, // Assuming the model has a userId field
        },
      });
    }
  }

  private async storeCoupons(store: Store, customerId: Id, zoneId: Id) {
    const currentDate = new Date(new Date().setHours(0, 0, 0, 0));
    currentDate.setHours(currentDate.getHours() + 2);
    const coupons = await this.prisma.coupon.findMany({
      where: {
        AND: [
          {
            startDate: {
              lte: currentDate,
            },
            expireDate: {
              gte: currentDate,
            },
          },
          { isActive: true },

          {
            OR: [
              { storeId: store.mainStoreId },
              { storeId: null },
              { storeId: store.id },
            ],
          },

          {
            OR: [{ zoneId: zoneId }, { zoneId: null }],
          },
          {
            OR: [
              {
                userId: customerId,
              },
              {
                userId: null,
              },
            ],
          },
        ],
      },

      // {
      //   type: CouponType.FREE_DELIVERY,
      // },
      // {
      //   type: CouponType.FIRST_ORDER,
      // },

      select: {
        id: true,
        nameAr: true,
        nameEn: true,
        type: true,
        discountType: true,
        limit: true,
        Zone: {
          select: {
            Point: true,
          },
        },
      },
    });
    if (customerId) {
      for (const coupon of coupons) {
        const userLimit = await this.prisma.userCoupon.count({
          where: {
            userId: customerId,
            couponId: coupon.id,
          },
        });
        if (userLimit >= coupon.limit) {
          coupons.splice(coupons.indexOf(coupon), 1);
        }

        delete coupon.limit;
      }
    }

    store['Coupon'] = coupons;
  }

  async findPlan(storeId: Id) {
    const plan = await this.prisma.plan.findFirst({
      where: {
        Stores: {
          some: {
            id: storeId,
          },
        },
      },
    });

    return plan;
  }
}
