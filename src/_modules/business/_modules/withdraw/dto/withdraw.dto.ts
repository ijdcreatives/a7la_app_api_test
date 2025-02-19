import { ApiProperty } from '@nestjs/swagger';
import { WithdrawStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsOptional, Min } from 'class-validator';
import { ValidateEnum } from 'src/decorators/dto/enum.decorator';
import { Optional } from 'src/decorators/dto/optional-input.decorator';
import { Required } from 'src/decorators/dto/required-input.decorator';
import { ValidateNumber } from 'src/decorators/dto/validators/validate-number.decorator';
import { PaginationParamsDTO } from 'src/dtos/params/pagination-params.dto';

export class FilterWithdrawDTO extends PaginationParamsDTO {
  @ApiProperty()
  @IsOptional()
  @Transform(({ value }) => +value)
  id?: Id;

  @ApiProperty()
  @IsOptional()
  @Transform(({ value }) => +value)
  storeId?: Id;

  @ApiProperty()
  @IsOptional()
  @Transform(({ value }) => +value)
  deliveryManId?: Id;

  @Optional()
  store?: string;

  @Optional()
  @ValidateEnum(WithdrawStatus)
  status?: WithdrawStatus;
}
export class CreateWithdrawDTO {
  @Optional()
  @ValidateNumber()
  storeAccountId?: number;

  @Optional()
  @ValidateNumber()
  deliveryAccountId?: number;

  @Required()
  @ValidateNumber()
  @Min(1)
  amount: number;
}
export class UpdateWithdrawDTO {
  @Required()
  @ValidateEnum(WithdrawStatus)
  status: WithdrawStatus;
}
