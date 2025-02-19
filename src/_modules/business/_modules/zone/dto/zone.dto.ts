import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { Allow, IsBoolean, IsOptional, IsString } from 'class-validator';
import { Optional } from 'src/decorators/dto/optional-input.decorator';
import { Required } from 'src/decorators/dto/required-input.decorator';
import { SortProp } from 'src/decorators/dto/sort-prop.decorator';
import { PaginationParamsDTO } from 'src/dtos/params/pagination-params.dto';

class zoneDTO {
  @Required()
  @Transform((value) => +value)
  lat: number;

  @Required()
  @Transform((value) => +value)
  lng: number;
}
export class CreateZoneDTO {
  @Required()
  @IsString()
  nameAr?: string;

  @Required()
  @IsString()
  nameEn?: string;

  @Optional()
  @IsString()
  displayDefault?: string;

  @Optional()
  @IsString()
  displayAr?: string;

  @Optional()
  @IsString()
  displayEn?: string;

  @Required({
    example: [
      { lat: 20.2, lng: 20.2 },
      { lat: 20.2, lng: 20.2 },
    ],
  })
  points: zoneDTO[];
}

export class UpdateZoneDTO extends PartialType(CreateZoneDTO) {
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

  @SortProp()
  price: SortOptions;

  @SortProp()
  status: SortOptions;

  @SortProp()
  store: SortOptions;
}
export class FilterZoneDTO extends PaginationParamsDTO {
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
