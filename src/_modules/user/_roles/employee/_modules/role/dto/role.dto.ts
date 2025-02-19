import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { Allow } from 'class-validator';
import { Optional } from 'src/decorators/dto/optional-input.decorator';
import { Required } from 'src/decorators/dto/required-input.decorator';
import { SortProp } from 'src/decorators/dto/sort-prop.decorator';
import { LocalizedNameDTO } from 'src/dtos/generic/localizedName.dto';
import { PaginationParamsDTO } from 'src/dtos/params/pagination-params.dto';

export class CreateRoleDTO extends LocalizedNameDTO {
  @Required({})
  permissions: string[];
}

export class UpdateRoleDTO extends PartialType(CreateRoleDTO) {}

export class SortNeighborDTO {
  @SortProp()
  id?: SortOptions;

  @SortProp()
  name?: SortOptions;

  @SortProp()
  permissions?: SortOptions;
}
export class FindRoleDTO extends PaginationParamsDTO {
  @Optional()
  @Transform(({ value }) => +value?.[0])
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
