import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  Allow,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Optional } from 'src/decorators/dto/optional-input.decorator';
import { Required } from 'src/decorators/dto/required-input.decorator';
import { SortProp } from 'src/decorators/dto/sort-prop.decorator';
import { StringArrayFilter } from 'src/decorators/filters/string.filter.decorator';
import { PaginationParamsDTO } from 'src/dtos/params/pagination-params.dto';

export class CreateZoneDto {
  @Required()
  @IsString()
  nameAr?: string;

  @Required()
  @IsString()
  nameEn?: string;

  @Required({})
  @IsString()
  displayDefault: string;

  @Optional()
  @IsString()
  displayAr?: string;

  @Optional()
  @IsString()
  displayEn?: string;
}

export class ZonePoints {
  @Required({})
  @IsNumber()
  @Transform(({ value }) => Number(value))
  lat: string;

  @Required({})
  @IsNumber()
  @Transform(({ value }) => Number(value))
  lng: string;
}
export class UpdateAttributeDTO extends PartialType(CreateZoneDto) {
  @Required()
  @IsString()
  @IsNotEmpty()
  nameAr: string;

  @Required()
  @IsNotEmpty()
  @IsString()
  nameEn: string;
}

export class SortNeighborDTO {
  @SortProp()
  id: SortOptions;

  @SortProp()
  nameAr: SortOptions;

  @SortProp()
  nameEn: SortOptions;
}

export class FilterAttributeDTO extends PaginationParamsDTO {
  @ApiProperty()
  @IsOptional()
  id?: number[];

  @StringArrayFilter([])
  nameAr?: string[];

  @StringArrayFilter([])
  nameEn?: string[];

  @Allow()
  @ApiProperty()
  orderBy?: SortNeighborDTO;
}
export class CreateAttributeWithModuleIdDTO {
  @Required()
  @ApiProperty({ required: true, type: Number })
  @IsNumber()
  @Transform(({ value }) => Number(value))
  moduleId: Id;
}
