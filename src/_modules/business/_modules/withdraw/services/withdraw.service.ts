import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/globals/services/prisma.service';

import { firstOrMany } from 'src/globals/helpers/first-or-many';
import { localizedObject } from 'src/globals/helpers/localized.return';
import {
  CreateWithdrawDTO,
  FilterWithdrawDTO,
  UpdateWithdrawDTO,
} from '../dto/withdraw.dto';
import {
  getWithdrawArgs,
  getWithdrawArgsWithSelect,
} from '../prisma-args/withdraw.prisma.args';
import { WithdrawHelperService } from './withdraw.helper.service';

@Injectable()
export class WithdrawService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helper: WithdrawHelperService,
  ) {}

  async create(body: CreateWithdrawDTO, storeId?: Id, deliveryManId?: Id) {
    await this.prisma.$transaction(async (tx) => {
      // !!!!! check balance
      await this.helper.canWithdraw(tx, body.amount, storeId, deliveryManId);
      await this.helper.decreaseBalance(
        tx,
        body.amount,
        storeId,
        deliveryManId,
      );
      await tx.withdraw.create({
        data: {
          ...body,
          storeId,
          deliveryManId,
        },
      });
    });
  }

  async update(id: Id, body: UpdateWithdrawDTO) {
    await this.prisma.$transaction(async (tx) => {
      const withdraw = await tx.withdraw.findUnique({ where: { id } });
      await tx.withdraw.update({ where: { id }, data: body });
      await this.helper.IncreaseOrDecreaseCurrentBalance(
        tx,
        withdraw.amount,
        body.status,
        withdraw.storeId,
        withdraw.deliveryManId,
      );
    });
  }

  async findAll(locale: Locale, filters: FilterWithdrawDTO) {
    const args = getWithdrawArgs(filters);
    const argsWithSelect = getWithdrawArgsWithSelect();

    const data = await this.prisma.withdraw[firstOrMany(filters?.id)]({
      ...argsWithSelect,
      ...args,
    });
    const total = await this.prisma.withdraw.count({ where: args.where });
    return { withdraws: localizedObject(data, locale), total };
  }
}
