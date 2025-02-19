import { Status } from '@prisma/client';
import { Allow } from 'class-validator';
import { SortProp } from 'src/decorators/dto/sort-prop.decorator';
import { EnumArrayFilter } from 'src/decorators/filters/enum.filter.decorator';
import { NumberArrayFilter } from 'src/decorators/filters/number.filter.decorator';
import { StringArrayFilter } from 'src/decorators/filters/string.filter.decorator';
import { PaginationParamsDTO } from 'src/dtos/params/pagination-params.dto';

export class SortUsersDTO {
  @SortProp()
  id: SortOptions;

  @SortProp()
  name: SortOptions;

  @SortProp()
  email: SortOptions;

  @SortProp()
  phone: SortOptions;

  @SortProp()
  createdAt: SortOptions;

  @SortProp()
  status: SortOptions;
}

export class FilterUserDTO extends PaginationParamsDTO {
  @NumberArrayFilter([])
  id?: number[];

  @StringArrayFilter([])
  name?: string[];

  @StringArrayFilter([])
  email?: string[];

  @StringArrayFilter([])
  phone?: string[];

  @StringArrayFilter([])
  createdAt?: string[];

  @EnumArrayFilter(Status, 'User Status', 'Choose User Status')
  status?: Status[];

  @Allow()
  orderBy?: SortUsersDTO;
}
