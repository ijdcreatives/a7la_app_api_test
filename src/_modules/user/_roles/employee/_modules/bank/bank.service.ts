import { ConflictException, Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { localizedObject } from 'src/globals/helpers/localized.return';
import { PrismaService } from 'src/globals/services/prisma.service';
import { getBankArgs } from './bank.prisma.args';
import { AddBankDTO, UpdateBankDTO } from './dtos/bank.dto';
import { FilterBankDTO } from './dtos/filter.dto';

@Injectable()
export class DeliveryBankService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  async findAll(filters: FilterBankDTO, locale: Locale) {
    const args = getBankArgs(filters);
    const data = await this.prisma.deliveryBank.findMany(args);

    return localizedObject(data, locale);
  }

  async create(data: AddBankDTO) {
    await this.prisma.deliveryBank.create({ data });
  }

  async update(id: Id, data: UpdateBankDTO) {
    await this.prisma.deliveryBank.update({
      where: { id, deliveryManId: data.deliveryManId },
      data,
    });
  }

  async delete(id: Id, deliveryManId?: Id) {
    await this.prisma.deliveryBank.delete({ where: { id, deliveryManId } });
  }

  async validateUnique(id: Id, data: AddBankDTO) {
    const isFound = await this.prisma.deliveryBank.findFirst({
      where: { deliveryManId: id, iban: data.iban, deletedAt: null },
    });
    if (isFound) throw new ConflictException('ACCOUNT_ALREADY_EXISTS');
  }
}
