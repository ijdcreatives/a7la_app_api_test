import { ApiProperty } from '@nestjs/swagger';
import { LoyaltyPointType, TransactionType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { Transform, Type } from 'class-transformer';
import { Allow } from 'class-validator';
import { Optional } from 'src/decorators/dto/optional-input.decorator';
import { Required } from 'src/decorators/dto/required-input.decorator';
import { SortProp } from 'src/decorators/dto/sort-prop.decorator';
import { ValidateDate } from 'src/decorators/dto/validators/validate-date.decorator';
import { ValidateNumberArray } from 'src/decorators/dto/validators/validate-number.decorator';
import { EnumArrayFilter } from 'src/decorators/filters/enum.filter.decorator';
import { PaginationParamsDTO } from 'src/dtos/params/pagination-params.dto';

export class CreateLoyaltyPointDTO {
  @Required()
  customerId: Id;

  @Required()
  earned: Decimal;

  @Required()
  converted: Decimal;

  @Required()
  current: Decimal;

  @Required()
  @EnumArrayFilter(LoyaltyPointType, 'Type', 'Loyalty Point Type')
  type: LoyaltyPointType;
}

export class convertPoints {
  @Required()
  points: number;
}

export class SortLoyaltyPointDTO {
  @SortProp()
  @ApiProperty({ example: 'asc' })
  id: SortOptions;
}
export class FilterLoyaltyPointDTO extends PaginationParamsDTO {
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
  loyaltyDateFrom?: Date;

  @Optional({ example: new Date() })
  @ValidateDate()
  loyaltyDateTo?: Date;

  @Allow()
  @ApiProperty({ type: [SortLoyaltyPointDTO] })
  @Type(() => SortLoyaltyPointDTO)
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value.map((item) =>
        typeof item === 'string' ? JSON.parse(item) : item,
      );
    }
    return value;
  })
  orderBy?: SortLoyaltyPointDTO[];
}
