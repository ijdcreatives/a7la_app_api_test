import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma, Roles } from '@prisma/client';
import { I18nService } from 'nestjs-i18n';
import { hashPassword } from 'src/globals/helpers/password.helpers';
import { PrismaService } from 'src/globals/services/prisma.service';
import { UserService } from '../../user.service';
import { prepareVendorData } from './prisma-args/vendor.prisma-args';
import { name } from 'ejs';
import { CreateVendorDTO, UpdateVendorDTO } from './dto/vendor.dto';

@Injectable()
export class VendorService {
  constructor(
    private prisma: PrismaService,
    private readonly userService: UserService,
    private readonly i18n: I18nService,
  ) {}

  async createVendor(
    tx: Prisma.TransactionClient,
    data: CreateVendorDTO & { storeId: Id; role: Id },
  ) {
    const { name, password, ...body } = data;
    await tx.user.create({
      data: {
        name,
        Vendor: {
          create: {
            password: hashPassword(password),
            ...body,
          },
        },
      },
    });
  }

  async updateVendor(id: Id, data: UpdateVendorDTO) {
    const { email, phone, password, ...rest } = data;
    await this.prisma.vendor.update({
      where: { id },
      data: {
        email,
        phone,
        password,
        User: {
          update: {
            name,
          },
        },
      },
    });
  }

  async updateVendorBranch(
    tx: Prisma.TransactionClient,
    id: Id,
    body: UpdateVendorDTO,
    storeId: Id,
    locale: Locale,
  ) {
    const { password, idNumber, ...user } = body;
    let confirmedPassword = password;

    await this.userService.accountAssociation({
      email: user.email,
      phone: user.phone,
      role: Roles.VENDOR,
    });
    const isFound = await this.userService.isUserExistAndHaveRole(
      { phone: user.phone, email: user.email, id: undefined },
      Roles.VENDOR,
    );
    const vendor = await tx.vendor.findUnique({
      where: {
        id,
      },
    });
    if (isFound && isFound.haveRole && vendor.storeId !== storeId) {
      throw new ConflictException(
        this.i18n.translate('user_already_found', { lang: locale }),
      );
    }
    if (confirmedPassword) confirmedPassword = hashPassword(password);
    await tx.vendor.update({
      where: { id },
      data: {
        ...(confirmedPassword ? { password: confirmedPassword } : {}),
        ...(idNumber ? { idNumber } : {}),
      },
    });
    await tx.user.update({
      where: { id },
      data: user,
    });
  }

  async isExist(data: { phone: string; email: string; id?: Id }) {
    const isFound = await this.prisma.vendor.findFirst({
      where: {
        OR: [
          {
            id: data.id ? data.id : undefined,
          },
          {
            email: data.email,
          },
          { phone: data.phone },
        ],
      },
    });
    if (isFound) {
      throw new ConflictException('user_already_found');
    }

    return isFound;
  }

  async getVendor(storeId: Id) {
    const vendor = await this.prisma.vendor.findFirst({
      where: {
        Store: {
          mainStoreId: storeId,
          default: true,
        },
      },
      select: {
        idNumber: true,
        phone: true,

        User: {
          select: {
            name: true,
          },
        },
      },
    });
    return {
      name: vendor.User.name,
      phone: vendor.phone,
      idNumber: vendor.idNumber,
    };
  }
}
