import { ConflictException, Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { localizedObject } from 'src/globals/helpers/localized.return';
import { PrismaService } from 'src/globals/services/prisma.service';
import { getBankArgs } from './bank.prisma.args';
import { AddBankDTO, UpdateBankDTO } from './dtos/bank.dto';
import { FilterBankDTO } from './dtos/filter.dto';

@Injectable()
export class StoreBankService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  async findAll(filters: FilterBankDTO, locale: Locale) {
    const args = getBankArgs(filters);
    const data = await this.prisma.storeBank.findMany(args);

    return localizedObject(data, locale);
  }

  async create(data: AddBankDTO) {
    await this.prisma.storeBank.create({ data });
  }

  async update(id: Id, data: UpdateBankDTO) {
    await this.prisma.storeBank.update({
      where: { id, storeId: data.storeId },
      data,
    });
  }

  async delete(id: Id, storeId?: Id) {
    await this.prisma.storeBank.delete({ where: { id, storeId } });
  }

  async validateUnique(id: Id, data: AddBankDTO) {
    const isFound = await this.prisma.storeBank.findFirst({
      where: { storeId: id, iban: data.iban, deletedAt: null },
    });
    if (isFound) throw new ConflictException('Account Already Exists');
  }
}
