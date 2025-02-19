import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { Transform, Type } from 'class-transformer';
import { Allow, IsNumber } from 'class-validator';
import { Optional } from 'src/decorators/dto/optional-input.decorator';
import { Required } from 'src/decorators/dto/required-input.decorator';
import { SortProp } from 'src/decorators/dto/sort-prop.decorator';
import { ValidateDate } from 'src/decorators/dto/validators/validate-date.decorator';
import { ValidateNumberArray } from 'src/decorators/dto/validators/validate-number.decorator';
import { EnumArrayFilter } from 'src/decorators/filters/enum.filter.decorator';
import { PaginationParamsDTO } from 'src/dtos/params/pagination-params.dto';

export class CreateTransactionDTO {
  balance?: number;

  @Required()
  customerId: Id;

  @Required()
  credit: Decimal;

  @Required()
  debit: Decimal;

  @Required()
  @EnumArrayFilter(TransactionType, 'Type', 'Transaction Type')
  type: TransactionType;
}

export class SortTransactionDTO {
  @SortProp()
  @ApiProperty({ example: 'asc' })
  id: SortOptions;
}
export class FilterTransactionDTO extends PaginationParamsDTO {
  @Optional()
  @ValidateNumberArray()
  id?: Id | Id[];

  @Optional()
  @ValidateNumberArray()
  customerId?: Id | Id[];

  @Optional()
  @EnumArrayFilter(TransactionType, 'Type', 'Transaction Type')
  type?: TransactionType[];

  @Optional({ example: new Date() })
  @ValidateDate()
  transactionDateFrom?: Date;

  @Optional({ example: new Date() })
  @ValidateDate()
  transactionDateTo?: Date;

  @Allow()
  @ApiProperty({ type: [SortTransactionDTO] })
  @Type(() => SortTransactionDTO)
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value.map((item) =>
        typeof item === 'string' ? JSON.parse(item) : item,
      );
    }
    return value;
  })
  orderBy?: SortTransactionDTO[];
}
export class FilterTransactionReportDTO extends PaginationParamsDTO {
  @Optional()
  @Transform(({ value }) => +value)
  @IsNumber()
  id: Id;

  @Optional()
  @Transform(({ value }) => +value)
  @IsNumber()
  moduleId: Id;

  @Optional()
  @Transform(({ value }) => +value)
  @IsNumber()
  storeId: Id;

  @Optional()
  @Transform(({ value }) => +value)
  @IsNumber()
  zoneId: Id;

  @Optional({ example: new Date() })
  @Transform(({ value }) => (value ? new Date(value) : null))
  transactionDateFrom?: Date;

  @Optional({ example: new Date() })
  @Transform(({ value }) => (value ? new Date(value) : null))
  transactionDateTo?: Date;
}
