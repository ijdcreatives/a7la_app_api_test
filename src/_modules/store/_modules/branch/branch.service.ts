import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatedBy, Prisma } from '@prisma/client';
import { localizedObject } from 'src/globals/helpers/localized.return';
import { PrismaService } from 'src/globals/services/prisma.service';
import { User } from '../../interface/user.interface';
import { Zone } from '../../interface/zone.interface';
import { prepareStoreData } from '../../prisma-args/store.prisma.args';
import { StoreHelperService } from '../../services/helper.service';
import { StoreProvider } from '../../store.provider';
import {
  CreateBranchDTO,
  FilterBranchDTO,
  UpdateBranchDTO,
} from './dto/branch.dto';
import { getBranchArgs } from './prisma-args/getArgs';

@Injectable()
export class BranchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly provider: StoreProvider,
    private readonly helper: StoreHelperService,
  ) {}

  /**
   * Creates a new store with associated vendor
   * @param user User information for vendor creation
   * @param body Store creation data
   * @param files Optional uploaded files for store
   * @throws BadRequestException if input validation fails
   * @throws ConflictException if store name already exists
   */
  async createBranch(
    tx: Prisma.TransactionClient,
    user: User,
    zoneBody: Zone,
    body: Omit<CreateBranchDTO, 'vendor'>,
    storeId: Id,
    main: boolean,
    locale: Locale,
    zoneId?: Id,
  ) {
    const { point, ...storeData } = body;
    // Step 1: Create branch and zone
    if (!point && !zoneId) {
      throw new BadRequestException('Either point or zoneId must be provided');
    }
    await this.helper.CheckVendorExist(user, storeId);

    const zone = await this.helper.CreateZoneStore(
      tx,
      zoneBody,
      body.zoneId || zoneId,
    );

    const mainStore = await this.helper.FindMainStore(tx, storeId);
    const createPrismaArgs = prepareStoreData(
      {
        ...storeData,
        ...mainStore,
        storeId,
        verified: mainStore.verified,
        status: mainStore.status,
        zoneId: body.zoneId || zoneId,
        cityId: body.cityId,
      },
      zone.id,
      point,
    );
    const store = await tx.store.create({
      data: {
        ...createPrismaArgs,
        default: body.default ? true : false,
        status: mainStore.status,
      },
    });
    // Step 2: Create Vendor
    const role = await tx.role.findFirst({
      where: { nameEn: main ? 'Vendor' : 'Manager' },
    });
    const vendor = await this.helper.CreateBranchVendor(
      tx,
      store.id,
      user,
      role.id,
    );

    await this.helper.createWallet(tx, store.id);

    // Step 3: Sync MNotificationSetup
    await this.provider.syncMNotificationSetup(tx, store.id);

    return { store, vendor };
  }

  /**
   * Creates a new store with associated vendor
   * @param user User information for vendor creation
   * @param body Store creation data
   * @param files Optional uploaded files for store
   * @throws BadRequestException if input validation fails
   * @throws ConflictException if store name already exists
   */
  async updateBranch(
    tx: Prisma.TransactionClient,
    user: User,
    zoneBody: Zone,
    body: UpdateBranchDTO,
    id: Id,
    locale: Locale,
  ): Promise<void> {
    // Step 1: Create branch and zone
    if (user) await this.helper.CheckVendorExist(user, id);
    const found = await tx.store.findUnique({ where: { id } });

    if (found.zoneId && body.zoneId) {
      const zone = await tx.zone.findUnique({ where: { id: found.zoneId } });
      if (zone.createdBy !== CreatedBy.ADMIN) {
        await tx.zone.delete({
          where: {
            id: found.zoneId,
          },
        });
      }
    }

    const zone = zoneBody
      ? await this.helper.CreateZoneStore(tx, zoneBody, body.zoneId)
      : undefined;

    await tx.store.update({
      where: { id },
      data: {
        ...(zone || body.zoneId ? { zoneId: zone.id } : { zoneId: undefined }),
        ...(body.zoneId ? { homeDelivery: true } : { homeDelivery: false }),
        ...(body.point
          ? { takeAway: true, carDelivery: true }
          : { takeAway: false, carDelivery: false }),
        address: body.address,
        branchName: body.branchName,
        phone: body.phone,
        cityId: body.cityId,
      },
    });

    // Step 2: Create Vendor
    const vendor = await this.prisma.store.findUnique({
      where: { id },
      select: {
        Vendor: {
          where: {
            default: true,
            deletedAt: null,
          },
        },
      },
    });
    if (user)
      await this.helper.UpdateBranchVendor(
        tx,
        vendor.Vendor[0].id,
        user,
        vendor.Vendor[0].storeId,
        locale,
      );
  }

  async findAll(
    mainStoreId: Id,
    filters: FilterBranchDTO,
    locale: Locale,
  ): Promise<{
    stores: any;
    total: number;
  }> {
    const getArgs = getBranchArgs(filters);
    const stores = await this.prisma.store.findMany({
      where: {
        mainStoreId,
        deletedAt: null,
      },

      ...getArgs,

      select: {
        id: true,
        branchName: true,
        address: true,
        Vendor: {
          select: {
            User: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
    const total = await this.prisma.store.count({
      where: {
        mainStoreId,
      },
    });
    return {
      stores: localizedObject(stores, locale),
      total,
    };
  }

  async findStatistics(mainStoreId: Id) {
    const totalVendors = await this.prisma.vendor.count({
      where: {
        Store: {
          mainStoreId,
        },
      },
    });
    const totalBranches = await this.prisma.store.count({
      where: {
        mainStoreId,
      },
    });
    return { totalVendors, totalBranches };
  }

  async deleteBranch(id: Id) {
    const store = await this.prisma.store.findUnique({
      where: { id },
    });
    if (store.mainStoreId !== null && store.default === true) {
      throw new BadRequestException('Cannot delete main store');
    }
    await this.prisma.store.delete({
      where: { id },
    });
  }
}
