import {
  BadRequestException,
  ConflictException,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Address, Customer, Prisma, Roles, Status, User } from '@prisma/client';
import { I18nService } from 'nestjs-i18n';
import { firstOrMany } from 'src/globals/helpers/first-or-many';
import { localizedObject } from 'src/globals/helpers/localized.return';
import {
  hashPassword,
  validateUserPassword,
} from 'src/globals/helpers/password.helpers';
import { PrismaService } from '../../globals/services/prisma.service';
import { GuestOTPService } from '../authentication/_modules/otp/guest-otp.service';
import { userJoinedRole } from '../authentication/helpers/role-helper';
import { handelSucceededTemp } from '../media/helpers/handel-temp-files';
import { HandelFiles } from '../media/helpers/handel-types';
import {
  AddAddressDTO,
  AddCarDeliveryDTO,
  UpdateAddressDTO,
  updateCarDeliveryDto,
} from './dto/address.dto';
import { UserFiltrationDTO } from './dto/filters.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { CreateUserDTO } from './dto/user.dto';
import { GetUsersArgs, PlainUserSelect } from './user.prisma.args';

interface UniqueUserValues {
  id?: Id;
  email: string;
  phone: string;
}
@Injectable()
export class UserService {
  constructor(
    @Inject(forwardRef(() => GuestOTPService))
    private readonly guestOTPService: GuestOTPService,
    private prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}
  async createUser(
    tx: Prisma.TransactionClient,
    data: CreateUserDTO,
    role: Roles,
  ) {
    const { phone, email, password } = data;
    const model = userJoinedRole(role);
    const isFound = await this.accountAssociation({ phone, email, role });
    if (isFound) {
      await tx[model].update({
        where: {
          id: isFound.id,
        },
        data: {
          ...data,
        },
      });
      return isFound;
    }

    const user = await tx[model].create({
      data: {
        ...data,
        password: hashPassword(password),
      },

      select: PlainUserSelect,
    });

    return user;
  }

  async getStatistics() {
    const customer = await this.prisma.customer.groupBy({
      by: ['status'],
      _count: true,
    });
    const total = [
      {
        customer: await this.prisma.customer.count({
          where: { deletedAt: null },
        }),
      },
      {
        delivery: await this.prisma.delivery.count({
          where: {
            deletedAt: null,
          },
        }),
      },
      {
        employee: await this.prisma.admin.count({
          where: {
            deletedAt: null,
          },
        }),
      },
    ];
    const delivery = await this.prisma.delivery.groupBy({
      by: ['status'],
      _count: true,
    });
    const topDeliveryMen = await this.prisma.delivery.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        phone: true,
        email: true,
        User: {
          select: {
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            Orders: true,
          },
        },
      },
      orderBy: {
        Orders: {
          _count: 'desc',
        },
      },
      take: 5,
    });

    const yearlyData = await this.getYearlyStatistics();

    return { total, customer, delivery, topDeliveryMen, yearlyData };
  }

  async getYearlyStatistics() {
    const data = await this.prisma.customer.groupBy({
      by: ['createdAt'],
      _count: {
        _all: true,
      },
    });

    const monthlyData = data.reduce(
      (acc, item) => {
        const date = new Date(item.createdAt);
        const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        acc[yearMonth] = acc[yearMonth] || 0;
        acc[yearMonth] += item._count?._all || 0; // Aggregate amounts
        return acc;
      },
      {} as Record<string, number>,
    );
    const monthlyDataArray = Object.entries(monthlyData).map(
      ([key, value]) => ({
        month: key, // Example: "2024-01"
        count: value, // Example: 250
      }),
    );

    return monthlyDataArray;
  }

  async updateUser(
    id: Id,
    data: UpdateUserDTO,
    locale: Locale,
    role: Roles,
    file?: UploadedFile,
  ) {
    const { password, ...rest } = data;
    const model = userJoinedRole(role);
    if (file) {
      HandelFiles.generatePath<{ image: UploadedFile }, UpdateUserDTO>(
        { image: file },
        rest,
        'Edit',
      );
    }

    const current = await this.isExist(id);

    await this.validateUniqueValues(data, locale, current);
    await this.prisma.$transaction(async (prisma) => {
      const user = await prisma.user.update({
        where: { id },
        data: rest,
      });
      if (data.password) {
        await this.prisma[model].update({
          where: { id },
          data: { password: hashPassword(data.password) },
        });
        await this.prisma.sessions.deleteMany({
          where: {
            userId: user.id,
            baseRole: Roles.DELIVERY,
          },
        });
      }
      handelSucceededTemp(file, 'Edit');
    });
  }

  async updateDefaultAddress(data: UpdateAddressDTO, currentUser: CurrentUser) {
    await this.prisma.$transaction(async (prisma) => {
      await prisma.address.updateMany({
        where: { userId: currentUser.id },
        data: {
          default: false,
        },
      });
      await prisma.address.update({
        where: { id: data.addressId },
        data: { default: data.default },
      });
    });
  }

  async userExist(
    {
      email,
      phone,
      password,
    }: {
      email?: string;
      phone?: string;
      password?: string;
    },
    role: Roles,
    locale: Locale,
  ) {
    const model = userJoinedRole(role);
    let isFound;
    if (phone) {
      isFound = await this.prisma[model].findUnique({
        where: {
          phone,
        },
        select: {
          phone: true,
          id: true,
          status: true,
          password: true,
          User: true,
        },
      });
    } else if (email) {
      isFound = await this.prisma[model].findUnique({
        where: {
          email,
        },
        select: {
          phone: true,
          id: true,
          status: true,
          password: true,
          User: true,
        },
      });
    }
    if (!isFound)
      throw new UnprocessableEntityException(
        this.i18n.translate('INVALID_CREDENTIALS', { lang: locale }),
      );
    validateUserPassword(password, isFound.password);
    await this.userCanLogin(isFound, locale, role);

    delete isFound.password;
    return isFound;
  }

  // async toggleNotification(id: Id) {
  //   const user = await this.isExist(id);

  //   return await this.prisma.user.update({
  //     where: { id },
  //     data: { acceptNotification: !user.acceptNotification },
  //   });
  // }

  // async deleteAccount(id: Id) {
  //   await this.isExist(id);

  //   await this.prisma.user.update({
  //     where: { id },
  //     data: { status: Status.INACTIVE, deletedAt: new Date() },
  //   });

  //   await this.prisma.sessions.deleteMany({ where: { userId: id } });
  // }

  async getUsers(
    paginationParams: PaginationParams,
    id?: Id,
    role?: Roles,
    filters?: UserFiltrationDTO,
  ) {
    if (role) filters.role = [role];
    const args = GetUsersArgs(paginationParams, id, filters);

    const users = await this.prisma.user[id ? 'findFirst' : 'findMany'](args);

    if (!users) {
      throw new NotFoundException('No users found');
    }

    const total = id
      ? undefined
      : await this.prisma.user.count({
          where: args.where,
        });

    return { users, total };
  }

  async getProfile(userId: Id, role: Roles, locale: Locale) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: PlainUserSelect,
    });

    await this.getDetails(user as any);
    if (role && role['baseRole'] === Roles.VENDOR) {
      const Vendor = await this.prisma.vendor.findFirst({
        where: {
          id: userId,
        },
        select: {
          id: true,
          role: true,
          storeId: true,
          fcm: true,
          idNumber: true,
          Store: {
            select: {
              id: true,
              nameAr: true,
              nameEn: true,
              branchName: true,
              closed: true,
              temporarilyClosed: true,
              verified: true,
              phone: true,
            },
          },
        },
      });
      if (!Vendor?.Store?.verified) {
        await this.guestOTPService.generateNewNumberOTP(
          Vendor.Store.phone,
          Roles.VENDOR,
        );
        throw new HttpException(
          {
            message: 'auth.storeNotVerified',
            data: { storeId: Vendor.Store.id, phone: Vendor.Store.phone },
          },
          HttpStatus.PRECONDITION_FAILED,
        );
      }

      return {
        ...user,
        role,
        Vendor: localizedObject(Vendor, locale),
      };
    } else if (role && role['baseRole'] === Roles.DELIVERY) {
      const delivery = await this.prisma.delivery.findUnique({
        where: {
          id: userId,
        },
        select: {
          verified: true,
          readyToReceiveOrders: true,
          rating: true,
          email: true,
          phone: true,
          id: true,
          User: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!delivery?.verified) {
        await this.guestOTPService.generateNewNumberOTP(
          delivery.phone,
          Roles.DELIVERY,
        );
        throw new HttpException(
          {
            message: 'auth.deliveryNotVerified',
            data: { deliveryId: delivery.id, phone: delivery.phone },
          },
          HttpStatus.PRECONDITION_FAILED,
        );
      }
      const userData = await this.getProfile(userId, Roles.DELIVERY, locale);
      // delete userData['Delivery']['User'];
      userData['Delivery'] = delivery;
      delete delivery['User'];

      return {
        ...userData,
        role,
      };
    }
    return { ...user, role };
  }

  async getAddress(
    currentUser: CurrentUser,
    id?: Id,
  ): Promise<Address | Address[]> {
    if (id) {
      const address = await this.prisma.address.findUnique({ where: { id } });
      if (!address || address.userId !== currentUser.id)
        throw new NotFoundException('Address not found');
    }
    return await this.prisma.address[firstOrMany(id)]({
      where: { userId: currentUser.id },
    });
  }

  async addAddress(data: AddAddressDTO, currentUser: CurrentUser) {
    return await this.prisma.address.create({
      data: {
        ...data,
        User: {
          connect: {
            id: currentUser.id,
          },
        },
      },
    });
  }
  private async getDetails(
    user: any & { _count: { Order: number } } & {
      _count: { Coupon: number };
    },
  ) {
    if (user.Customer) {
      user['earningPoints'] = user.Customer.earningPoints;
      user['wallet'] = user.Customer.wallet;
      user['coupon'] = user._count.Coupon;
    }
    delete user.Customer;
    delete user._count;
  }

  async addCarDelivery(data: AddCarDeliveryDTO, _: CurrentUser) {
    return await this.prisma.car.create({
      data: {
        ...data,
        customerId: _.id,
      },
    });
  }
  async getCarDelivery(currentUser: CurrentUser) {
    return await this.prisma.car.findMany({
      where: { customerId: currentUser.id },
    });
  }

  async returnExist(
    idOrPhoneOrEmail: Id | string | UniqueUserValues,
    role?: Roles,
  ) {
    let obj: UniqueUserValues;
    if (idOrPhoneOrEmail instanceof Object) obj = idOrPhoneOrEmail;
    else
      obj = {
        email: idOrPhoneOrEmail.toString(),
        phone: idOrPhoneOrEmail.toString(),
        id: +idOrPhoneOrEmail || undefined,
      };

    const { id, phone, email } = obj;

    const model = userJoinedRole(role);
    const user = await this.prisma[model].findFirst({
      where: {
        OR: [{ id: +id || undefined }, { phone }, { email }],
      },
    });

    if (!user) return;

    return user;
  }

  async isUserExistAndHaveRole(
    idOrPhoneOrEmail: Id | string | UniqueUserValues,
    role: Roles,
  ) {
    const model = userJoinedRole(role);
    const user = await this.returnExist(idOrPhoneOrEmail, role);
    if (!user || !user[model]) return { user, haveRole: false };
    return { user, haveRole: true };
  }

  async isExist(idOrPhoneOrEmail: Id | string, role?: Roles) {
    const model = userJoinedRole(role);
    const user = await this.returnExist(idOrPhoneOrEmail, role);
    if (!user || (!user[model] && model))
      throw new NotFoundException('User not found');
    return user;
  }

  async validateUniqueValues(
    {
      phone,
      email,
    }: {
      phone?: string;
      email?: string;
    },
    locale: Locale,
    role: Roles,
    mine?: {
      phone?: string;
      email?: string;
    },
  ) {
    const model = userJoinedRole(role);
    if (phone && phone !== mine?.phone) {
      const phoneExists = await this.prisma[model].findFirst({
        where: { phone },
        select: { id: true },
      });

      if (phoneExists)
        throw new ConflictException(
          this.i18n.t('PHONE_ALREADY_USED', {
            lang: locale,
            args: { name: locale === 'ar' ? 'الهاتف' : 'Phone' },
          }),
        );
    }
    if (email && email !== mine?.email) {
      const emailExists = await this.prisma[model].findFirst({
        where: { email },
        select: { id: true },
      });

      if (emailExists)
        throw new ConflictException(
          this.i18n.t('CONFLICT', {
            lang: locale,
            args: { name: locale === 'ar' ? 'البريد الإلكتروني' : 'Email' },
          }),
        );
    }
  }
  async validateUniqueCar(data: any, currentUser: CurrentUser) {
    const exist = await this.prisma.car.findFirst({
      where: {
        customerId: currentUser.id,
        plate: data.plate,
        deletedAt: null,
      },
    });
    if (data.plate && exist) {
      if (!data.carId) throw new ConflictException('Car already exists');
      else if (data.carId !== exist.id)
        throw new ConflictException('Car already exists');
    }
  }
  private async validateValues(
    {
      phone,
      email,
    }: {
      phone?: string;
      email?: string;
    },
    role: Roles,

    mine?: {
      phone?: string;
      email?: string;
    },
  ) {
    const model = userJoinedRole(role);

    if (phone && phone !== mine?.phone) {
      const phoneExists = await this.prisma[model].findFirst({
        where: { phone, deletedAt: null },
        select: { id: true, email: true, phone: true },
      });
      if (phoneExists) return phoneExists;
    }
    if (email && email !== mine?.email) {
      const emailExists = await this.prisma[model].findFirst({
        where: { email, deletedAt: null },
        select: { id: true, email: true, phone: true },
      });
      if (emailExists) return emailExists;
    }
    return null;
  }
  async updateUserOnlineStatus(userId: Id, isOnline: boolean) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { isOnline },
    });
  }

  async DeleteAddress(id: Id) {
    await this.prisma.address.delete({ where: { id } });
  }
  async DeleteCar(id: Id) {
    await this.prisma.car.delete({ where: { id } });
  }

  async validateUniqueAddress(
    data: any,
    currentUser: CurrentUser,
    update: boolean,
  ) {
    if (update) {
      const address = await this.prisma.address.findFirst({
        where: {
          userId: currentUser.id,
          id: data.addressId,
        },
      });
      if (!address) {
        throw new ConflictException('Forbidden Resource');
      }
    }
  }

  async UpdateCar(data: updateCarDeliveryDto) {
    const { carId, ...body } = data;
    await this.prisma.car.update({
      where: {
        id: carId,
      },
      data: body,
    });
  }
  async deleteAccount(userId: Id) {
    await this.prisma.user.delete({ where: { id: userId } });
  }

  async accountAssociation({
    phone,
    email,
    role,
  }: {
    phone: string;
    email: string;
    role: Roles;
  }) {
    const isFound = await this.validateValues({ phone, email }, role);
    if (
      isFound &&
      email &&
      isFound.email !== null &&
      phone &&
      isFound.email !== email
    ) {
      throw new BadRequestException(
        'The provided email is already associated with a different phone number ',
      );
    }
    if (
      isFound &&
      email &&
      isFound.phone !== null &&
      phone &&
      isFound.phone !== phone
    ) {
      throw new BadRequestException(
        'The provided phone is already associated with a different email',
      );
    }

    return isFound;
  }

  private async userCanLogin(isFound: any, locale: Locale, role: Roles) {
    if (isFound['status'] === Status.NOT_VERIFIED) {
      await this.guestOTPService.generateNewNumberOTP(isFound.phone, role);
      throw new HttpException(
        {
          message: this.i18n.translate('NOT_VERIFIED', {
            lang: locale,
            args: { name: locale === 'ar' ? 'المستخدم' : 'User' },
          }),
          data: { id: isFound.id, phone: isFound.phone },
        },
        HttpStatus.PRECONDITION_FAILED,
      );
    }
    if (isFound['status'] !== Status.ACTIVE)
      throw new BadRequestException('User is not active');

    delete isFound['status'];
  }
}
