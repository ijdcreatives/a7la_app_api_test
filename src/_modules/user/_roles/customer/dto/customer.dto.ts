import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { Allow, min } from 'class-validator';
import { Optional } from 'src/decorators/dto/optional-input.decorator';
import { Required } from 'src/decorators/dto/required-input.decorator';
import { SortProp } from 'src/decorators/dto/sort-prop.decorator';
import { ValidateBoolean } from 'src/decorators/dto/validators/validate-boolean.decorator';
import { ValidateEmail } from 'src/decorators/dto/validators/validate-email.decorator';
import { ValidatePassword } from 'src/decorators/dto/validators/validate-password.decorator';
import { ValidatePhone } from 'src/decorators/dto/validators/validate-phone.decorator';
import { ValidateString } from 'src/decorators/dto/validators/validate-string.decorator';
import { ValidateUnique } from 'src/decorators/dto/validators/validate-unique-number.decorator';
import { EnumArrayFilter } from 'src/decorators/filters/enum.filter.decorator';
import { PaginationParamsDTO } from 'src/dtos/params/pagination-params.dto';

export class SortNeighborDTO {
  @SortProp()
  id?: SortOptions;
}
export class FilterCustomerDTO extends PaginationParamsDTO {
  @Optional()
  @Transform(({ value }) => +value)
  id?: Id;

  @Optional({ example: new Date() })
  @Transform(({ value }) => (value ? new Date(value) : null))
  OrderDateFrom?: Date;

  @Optional({ example: new Date() })
  @Transform(({ value }) => (value ? new Date(value) : null))
  OrderDateTo?: Date;

  @Optional({ example: new Date() })
  @Transform(({ value }) => (value ? new Date(value) : null))
  CustomerDateFrom?: Date;

  @Optional({ example: new Date() })
  @Transform(({ value }) => (value ? new Date(value) : null))
  CustomerDateTo?: Date;

  @Optional()
  @EnumArrayFilter(Status, 'User Status', 'Choose user status')
  status: Status;

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
export class EnableFaceIdDTO {
  @Required()
  deviceId: string;
}

export class CustomerRegisterDTO {
  @Required()
  @ValidateString()
  name: string;

  @Required()
  @ValidatePhone()
  @ValidateUnique<'customer'>({ model: 'customer' })
  phone: string;

  @Required()
  @ValidateEmail()
  @ValidateUnique<'customer'>({ model: 'customer' })
  email: string;

  @Required()
  @ValidatePassword()
  password: string;

  @Required()
  @ValidateBoolean()
  male: boolean;
}

export class CustomerLoginDTO {
  @Required()
  @ValidatePhone()
  phone: string;

  @Required()
  @ValidatePassword()
  password: string;
}
