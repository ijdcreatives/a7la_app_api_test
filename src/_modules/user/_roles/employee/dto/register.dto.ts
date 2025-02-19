import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { Allow, IsNumber } from 'class-validator';
import { CreateUserDTO } from 'src/_modules/user/dto/user.dto';
import { Optional } from 'src/decorators/dto/optional-input.decorator';
import { SortProp } from 'src/decorators/dto/sort-prop.decorator';
import { PaginationParamsDTO } from 'src/dtos/params/pagination-params.dto';

export class CreateEmployeeDTO extends CreateUserDTO {
  @ApiProperty({ required: true })
  @Transform(({ value }) => +value)
  @IsNumber()
  roleId: number;
}

export class UpdateEmployeeDTO extends PartialType(CreateEmployeeDTO) {}

export class SortNeighborDTO {
  @SortProp()
  id?: SortOptions;

  @SortProp()
  name?: SortOptions;

  @SortProp()
  email?: SortOptions;

  @SortProp()
  phone?: SortOptions;

  @SortProp()
  role?: SortOptions;
}
export class FilterEmployeeDTO extends PaginationParamsDTO {
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
