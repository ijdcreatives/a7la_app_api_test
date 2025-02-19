import { Injectable } from '@nestjs/common';
import { TransactionType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { TransactionService } from 'src/_modules/transaction/service/transaction.service';
import { PrismaService } from 'src/globals/services/prisma.service';
import { CreateFundDTO } from './dto/fund.dto';

@Injectable()
export class FundService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly transactionService: TransactionService,
  ) {}
  async create(body: CreateFundDTO) {
    await this.prisma.fund.create({
      data: {
        ...body,
      },
    });
    const data = {
      customerId: body.customerId,
      debit: new Decimal(0),
      credit: new Decimal(+body.price),
      type: TransactionType.FUND,
    };
    await this.transactionService.createTransaction(data);
  }
}
