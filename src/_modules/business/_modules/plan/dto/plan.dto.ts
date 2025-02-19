import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { Allow, IsBoolean, IsOptional, IsString, Min } from 'class-validator';
import { Optional } from 'src/decorators/dto/optional-input.decorator';
import { Required } from 'src/decorators/dto/required-input.decorator';
import { SortProp } from 'src/decorators/dto/sort-prop.decorator';
import { PaginationParamsDTO } from 'src/dtos/params/pagination-params.dto';

export class CreatePlanDTO {
  @Required()
  @IsString()
  nameAr?: string;

  @Required()
  @IsString()
  nameEn?: string;

  @Required({})
  @IsString()
  infoDefault: string;

  @Optional()
  @IsString()
  infoAr?: string;

  @Optional()
  @IsString()
  infoEn?: string;

  @Optional()
  @IsBoolean()
  chat: boolean;

  @Optional()
  @IsBoolean()
  pos: boolean;

  @Optional()
  @IsBoolean()
  ordersLimited: boolean;

  @Optional()
  @IsBoolean()
  itemsLimited: boolean;

  @Optional()
  @Min(1)
  price: number;

  @Optional()
  days: number;

  @Optional()
  orders: number;

  @Optional()
  items: number;
}

export class UpdatePlanDTO extends PartialType(CreatePlanDTO) {
  @Optional()
  @IsBoolean()
  isActive?: boolean;
}

export class SortAddonDTO {
  @SortProp()
  @ApiProperty({ example: 'asc' })
  id: SortOptions;

  @SortProp()
  name: SortOptions;
}
export class FilterPlanDTO extends PaginationParamsDTO {
  @ApiProperty()
  @IsOptional()
  @Transform(({ value }) => +value)
  id?: Id;

  @Optional()
  name?: string;

  @Allow()
  @ApiProperty({ type: [SortAddonDTO] })
  @Type(() => SortAddonDTO)
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value.map((item) =>
        typeof item === 'string' ? JSON.parse(item) : item,
      );
    }
    return value;
  })
  orderBy?: SortAddonDTO[];
}
