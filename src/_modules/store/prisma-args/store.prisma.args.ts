import {
  CouponType,
  Prisma,
  Roles,
  Store,
  StoreStatus,
  Zone,
} from '@prisma/client';
import { paginateOrNot } from 'src/globals/helpers/pagination-params';
import { filterKey, orderKey } from 'src/globals/helpers/prisma-filters';
import {
  CreateStoreDTO,
  FilterNearestDTO,
  FilterStoreDTO,
  PointDTO,
  UpdateStoreDTO,
} from '../dto/store.dto';

export const getArgs = (
  query: FilterStoreDTO,
  locale: Locale,
  role: Roles,
  currentUser: CurrentUser,
  currentZones: Zone[],
) => {
  const Locale = locale.toLowerCase().charAt(0).toUpperCase() + locale.slice(1);
  const { orderBy, page, limit, ...filter } = query;
  const currentTime = new Date();
  const currentDay = currentTime.getDay();
  //change time
  currentTime.setHours(currentTime.getHours() + 2);

  const Days = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];

  const searchArray = [
    filterKey<Store>(filter, 'id'),
    filterKey<Store>(filter, 'zoneId'),
    filterKey<Store>(filter, 'moduleId'),
    filterKey<Store>(filter, 'status'),
    filterKey<Store>(filter, 'mainStoreId'),

    {
      verified: true,
    },
    role !== Roles.ADMIN && {
      mainStoreId: {
        not: null,
      },
    },

    role === Roles.ADMIN && {
      mainStoreId: null,
    },

    ...(role === Roles.CUSTOMER
      ? [
          {
            temporarilyClosed: false,
            MainStore: {
              StoreSchedule: {
                some: {
                  day: Days[currentDay].toUpperCase(),
                  openingTime: {
                    lte: currentTime,
                  },
                  closingTime: {
                    gte: currentTime,
                  },
                },
              },
            },
          },
        ]
      : []),
    ...(role === Roles.CUSTOMER
      ? [
          {
            zoneId: {
              in: currentZones.map((zone) => zone.id),
            },
          },
        ]
      : []),

    filter.isOffer && {
      MainStore: {
        Product: {
          some: {
            isOffer: true,
          },
        },
      },
    },

    filter.homeDelivery && {
      homeDelivery: true,
    },
    filter.carDelivery && {
      carDelivery: true,
    },
    filter.takeAway && {
      takeAway: true,
    },
    ...filterCheck(filter, currentUser, role),
  ].filter(Boolean) as Prisma.StoreWhereInput[];
  const orderArray = [
    orderKey('id', `id`, orderBy),
    orderKey('zone', `Zone.name${Locale}`, orderBy),
    orderKey('name', `name${Locale}`, orderBy),
    orderKey('recommended', 'isRecommended', orderBy),
    orderKey('fasterDelivery', 'deliveryTime', orderBy),
    orderKey('status', 'status', orderBy),
    orderKey('orders', 'Order._count', orderBy),
    ...(role === Roles.ADMIN
      ? [
          {
            createdAt: 'desc',
          },
        ]
      : []),
  ].filter(Boolean) as Prisma.StoreOrderByWithRelationInput[];
  return {
    ...paginateOrNot({ limit, page }, query?.id),
    orderBy: orderArray,
    where: {
      AND: searchArray,
    },
  } satisfies Prisma.StoreFindManyArgs;
};

export const panelSelectArgs = (filters: FilterStoreDTO | FilterNearestDTO) => {
  const selectArgs: Prisma.StoreSelect = {
    id: true,
    nameAr: true,
    nameEn: true,
    homeDelivery: true,
    takeAway: true,
    carDelivery: true,
    minimumOrderAmount: true,
    minDeliveryTime: true,
    maxDeliveryTime: true,
    address: true,
    cover: true,
    logo: true,
    closed: true,
    status: true,
    rating: true,
    review: true,
    phone: true,
    branchName: true,
    zoneId: true,
    isRecommended: true,
    StoreSchedule: true,
    MainStore: {
      select: {
        StoreSchedule: true,
      },
    },
    Module: {
      select: {
        id: true,
        nameAr: true,
        nameEn: true,
      },
    },
    _count: {
      select: {
        Product: true,
        Order: true,
      },
    },
    ...('id' in filters &&
      filters.id && {
        Plan: true,
        tax: true,
        City: true,

        temporarilyClosed: true,
      }),
    Vendor: {
      where: {
        role: {
          in: [3, 5],
        },
        deletedAt: null,
        default: true,
      },
      select: {
        idNumber: true,
        email: true,
        phone: true,
        User: {
          select: {
            name: true,
          },
        },
      },
    },
    Zone: {
      select: {
        id: true,
        nameAr: true,
        nameEn: true,
        Point: {
          select: {
            lng: true,
            lat: true,
          },
        },
      },
    },
  };
  return selectArgs;
};

export const userSelectArgs = (userId: Id) => {
  const selectArgs: Prisma.StoreSelect = {
    id: true,
    nameAr: true,
    nameEn: true,
    homeDelivery: true,
    takeAway: true,
    cover: true,
    logo: true,
    closed: true,
    rating: true,
    carDelivery: true,
    deliveryTime: true,
    tax: true,
    ...(userId && {
      FavoriteStore: {
        where: {
          customerId: userId,
        },
      },
    }),
    moduleId: true,
    mainStoreId: true,
    zoneId: true,
    review: true,
    MainStore: {
      select: {
        StoreSchedule: true,
      },
    },
    Zone: {
      select: {
        Point: {
          select: {
            lat: true,
            lng: true,
          },
        },
      },
    },

    _count: {
      select: {
        Order: true,
      },
    },
  };
  return selectArgs;
};
export const getArgsWithSelect = (
  filters: FilterStoreDTO | FilterNearestDTO,
  role: Roles,
  userId?: Id,
) => {
  const selectArgs = {
    ADMIN: panelSelectArgs(filters),
    VENDOR: panelSelectArgs(filters),
    CUSTOMER: userSelectArgs(userId),
  };

  return {
    select: selectArgs[role],
  } satisfies Prisma.StoreFindManyArgs;
};
export const prepareStoreData = (
  data: Omit<
    CreateStoreDTO & {
      storeId?: Id;
      branchName?: string;
      verified?: boolean;
      zoneId?: Id;
      cityId: Id;
      status?: StoreStatus;
    },
    'point' | 'vendor'
  >,
  zoneId: Id,
  point: PointDTO,
) => {
  return {
    moduleId: data.moduleId,
    cover: data.cover,
    logo: data.logo,
    zoneId: data.zoneId || zoneId,
    address: data.address,
    takeAway: point ? true : false,
    carDelivery: point ? true : false,
    ...(data.cityId ? { cityId: data.cityId } : {}),
    ...(point ? { lat: point.lat, lng: point.lng } : {}),
    phone: data.phone,
    homeDelivery: data.zoneId ? true : false,
    ...(data.verified ? { verified: data.verified } : {}),
    ...(data.storeId ? { mainStoreId: data.storeId } : { mainStoreId: null }),
    tax: data.tax,
    ...(data.branchName
      ? { branchName: data.branchName }
      : { branchName: null }),
    maxDeliveryTime: data.maxDeliveryTime,
    minDeliveryTime: data.minDeliveryTime,
    deliveryTime: (data.maxDeliveryTime + data.minDeliveryTime) / 2,
    nameAr: data.nameAr,
    nameEn: data.nameEn,
    ...(data.status ? { status: data.status } : {}),
  };
};

export const prepareUpdateStoreData = (
  data: Omit<UpdateStoreDTO, 'vendor'>,
) => {
  const { point, zoneId, days, status, ...rest } = data;

  return {
    ...rest,
    ...(zoneId ? { zoneId, homeDelivery: true } : {}),
    ...(point
      ? { lat: point.lat, lng: point.lng, takeAway: true, carDelivery: true }
      : {}),
  };
};

const filterCheck = (
  filter: FilterStoreDTO,
  currentUser: CurrentUser,
  role: Roles,
) => {
  return [
    filter.freeDelivery && {
      MainStore: {
        Coupon: {
          some: {
            type: CouponType.FREE_DELIVERY,
            isActive: true,
          },
        },
      },
    },
    filter.campaign && {
      Product: {
        some: {
          discount: {
            gt: 0,
          },
        },
      },
    },
    filter.favorite &&
      currentUser &&
      currentUser.id && {
        FavoriteStore: {
          some: {
            customerId: currentUser.id,
          },
        },
      },
    filter.categoryId && {
      MainStore: {
        Product: {
          some: {
            Category: {
              id: filter.categoryId,
            },
          },
        },
      },
    },
    filter.name && {
      OR: [
        {
          nameEn: {
            contains: filter.name?.at(0),
          },
        },
        {
          nameAr: {
            contains: filter.name?.at(0),
          },
        },
      ],
    },

    filter.owner && role === Roles.ADMIN
      ? {
          Vendor: {
            some: {
              User: {
                OR: [
                  {
                    firstName: {
                      equals: filter.owner?.at(0),
                    },
                  },
                  {
                    lastName: {
                      eq: filter.owner?.at(0),
                    },
                  },
                ],
              },
            },
          },
        }
      : undefined,

    role === Roles.CUSTOMER
      ? {
          status: StoreStatus.ACTIVE,
        }
      : undefined,
  ].filter(Boolean) as Prisma.StoreWhereInput[];
};
