import { Injectable } from '@nestjs/common';
import { Roles, Status } from '@prisma/client';
import { firstOrMany } from 'src/globals/helpers/first-or-many';
import { localizedObject } from 'src/globals/helpers/localized.return';
import { PrismaService } from 'src/globals/services/prisma.service';
import {
  CustomerLoginDTO,
  CustomerRegisterDTO,
  EnableFaceIdDTO,
  FilterCustomerDTO,
} from './dto/customer.dto';
import {
  getArgs,
  getArgsWithCustomerSelect,
} from './prisma-args/customer.prisma.args';
import { CUSTOMER } from './types/customer.type';
import { hashPassword } from 'src/globals/helpers/password.helpers';
import { UserService } from '../../user.service';
import { TokenService } from 'src/_modules/authentication/services/jwt.service';

@Injectable()
export class CustomerService {
  constructor(
    private prisma: PrismaService,
    private readonly user: UserService,
    private readonly token: TokenService,
  ) {}

  async findAll(locale: Locale, filters: FilterCustomerDTO, role: Roles) {
    const args = getArgs(filters, role);
    const getArgsWithInclude = getArgsWithCustomerSelect();
    const data = await this.prisma.customer[firstOrMany(filters?.id)]({
      ...getArgsWithInclude,
      ...args,
    });

    let total = 0;
    if (!filters.id) {
      total = await this.prisma.customer.count({ where: args.where });
    }

    // Transform the data to match CUSTOMER type
    const customersToFormat = Array.isArray(data) ? data : [data];

    await this.ReformatUsers(customersToFormat as unknown as CUSTOMER[]);

    return {
      data: localizedObject(data, locale),
      total,
    };
  }

  async enableFaceId(currentUser: CurrentUser, body: EnableFaceIdDTO) {
    await this.prisma.customer.update({
      where: { id: currentUser.id },
      data: { deviceId: body.deviceId },
    });
  }

  private async ReformatUsers(data: CUSTOMER[]) {
    for (const user of data) {
      user.User['totalPrice'] = await this.sumOrderPrices(user.User.id);
      user.User['totalOrders'] = user._count.Order | 0;
      user.User['status'] = user.status;
      user.User['createdAt'] = user.createdAt;
      delete user.status;
      delete user.createdAt;
      delete user._count;
    }
  }
  private async sumOrderPrices(customerId: Id) {
    const result = await this.prisma.order.aggregate({
      where: {
        customerId,
      },
      _sum: {
        totalPrice: true, // Replace `totalPrice` with your actual column name for price
      },
    });
    return result._sum.totalPrice | 0;
  }
  //  Reminder to Make it globally
  async getStatistics() {
    const statistics = await this.prisma.customer.groupBy({
      by: ['status'],
      _count: true,
    });

    const growth = await this.prisma.customer.groupBy({
      by: ['createdAt'],
      _count: true,
    });

    const monthlyData = growth.reduce(
      (acc, item) => {
        const date = new Date(item.createdAt);
        const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        acc[yearMonth] = acc[yearMonth] || 0;
        acc[yearMonth] += item._count || 0;
        return acc;
      },
      {} as Record<string, number>,
    );
    const monthlyDataArray = Object.entries(monthlyData).map(
      ([key, value]) => ({
        month: key,
        count: value,
      }),
    );
    const reviews = await this.prisma.review.groupBy({
      by: ['rating'],
      _count: true,
    });

    return {
      statistics: statistics,
      customerGrowth: monthlyDataArray,
      reviews,
    };
  }

  async register(dto: CustomerRegisterDTO) {
    const { name, password, ...rest } = dto;
    const role = await this.prisma.role.findFirst({
      where: { nameEn: 'Customer' },
    });
    const user = await this.prisma.user.create({
      data: {
        name,
        Customer: {
          create: {
            role: role.id,
            ...rest,
            password: hashPassword(password),
          },
        },
      },
      select: {
        Customer: {
          select: {
            id: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    return user.Customer;
  }

  async login(dto: CustomerLoginDTO, locale: Locale) {
    const user = await this.user.userExist(dto, Roles.CUSTOMER, locale);
    const data = await this.user.getProfile(user.id, Roles.CUSTOMER, locale);
    const role = await this.prisma.role.findFirst({
      where: { nameEn: 'Customer' },
    });
    const accessToken = await this.token.generateToken(
      user.id,
      role.id,
      Roles.CUSTOMER,
      undefined,
    );
    return { user: data, accessToken };
  }
}
