import { ApiProperty } from '@nestjs/swagger';
import { ModuleType } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { Allow, IsString } from 'class-validator';
import { Optional } from 'src/decorators/dto/optional-input.decorator';
import { Required } from 'src/decorators/dto/required-input.decorator';
import { SortProp } from 'src/decorators/dto/sort-prop.decorator';
import { EnumArrayFilter } from 'src/decorators/filters/enum.filter.decorator';
import { PaginationParamsDTO } from 'src/dtos/params/pagination-params.dto';

export class CreateModuleDto {
  @Required()
  @IsString()
  descriptionEn: string;

  @Required()
  @IsString()
  descriptionAr: string;

  @Required()
  nameEn: string;

  @Required()
  @IsString()
  nameAr: string;

  @EnumArrayFilter(ModuleType, 'Module Types', 'Choose Module Type')
  type: ModuleType;

  @ApiProperty({ type: String, format: 'binary', required: true })
  icon: string;

  @ApiProperty({ type: String, format: 'binary', required: true })
  thumbnail: string;
}

export class SortNeighborDTO {
  @SortProp()
  id?: SortOptions;

  @SortProp()
  name?: SortOptions;

  @SortProp()
  type?: SortOptions;

  @SortProp()
  stores?: SortOptions;

  @SortProp()
  status?: SortOptions;
}

export class FilterModuleDTO extends PaginationParamsDTO {
  @Optional()
  @Transform(({ value }) => +value)
  id?: Id;

  @Optional()
  name?: string;

  @Allow()
  @ApiProperty({ type: [SortNeighborDTO] })
  @Type(() => SortNeighborDTO)
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value.map((item) =>
        typeof item === 'string' ? JSON.parse(item) : item,
      );
    }
    return value;
  })
  orderBy?: SortNeighborDTO[];
}
