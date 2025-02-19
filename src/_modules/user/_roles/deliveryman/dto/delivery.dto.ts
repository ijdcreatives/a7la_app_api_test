import { ApiProperty, PartialType } from '@nestjs/swagger';
import { DeliveryManStatus, Roles, Status } from '@prisma/client';
import {
  Allow,
  IsEmail,
  IsEnum,
  IsString,
  IsStrongPassword,
  MinLength,
} from 'class-validator';
import { ValidateEnum } from 'src/decorators/dto/enum.decorator';
import { Optional } from 'src/decorators/dto/optional-input.decorator';
import { Required } from 'src/decorators/dto/required-input.decorator';
import { SortProp } from 'src/decorators/dto/sort-prop.decorator';
import { ValidateBoolean } from 'src/decorators/dto/validators/validate-boolean.decorator';
import { ValidateDate } from 'src/decorators/dto/validators/validate-date.decorator';
import { ValidateNumber } from 'src/decorators/dto/validators/validate-number.decorator';
import { ValidateOTP } from 'src/decorators/dto/validators/validate-otp.decorator';
import { ValidatePhone } from 'src/decorators/dto/validators/validate-phone.decorator';
import { PaginationParamsDTO } from 'src/dtos/params/pagination-params.dto';
export class CreateDeliverymanDto {
  @Required({})
  @IsString()
  @MinLength(2)
  firstName: string;

  @Required({})
  @IsString()
  @MinLength(2)
  lastName: string;

  @Required({})
  @ValidatePhone()
  phone: string;

  @Required({})
  @ValidateNumber()
  cityId: Id;

  @Required({})
  @ValidateNumber()
  nationalityId: Id;

  @Required({})
  @IsEmail()
  email: string;

  @Required({})
  @IsStrongPassword()
  password: string;

  @Required({})
  @IsString()
  identifyNumber: string;

  @ApiProperty({ type: String, format: 'binary', required: true })
  image: string;

  @ApiProperty({ type: String, format: 'binary', required: true })
  identifyImage: string;
}

export class UpdateDeliverymanDTO extends PartialType(CreateDeliverymanDto) {
  @Optional()
  @ValidateNumber()
  id?: Id;

  @Optional()
  @ApiProperty({ enum: Status })
  @IsEnum(Status)
  status?: Status;

  @Optional()
  @ValidateBoolean()
  readyToReceiveOrders?: boolean;
}
export enum SortOption {
  ASC = 'asc',
  DESC = 'desc',
}
export class SortNeighborDTO {
  @SortProp()
  id?: SortOptions;

  @SortProp()
  name?: SortOptions;

  @SortProp()
  phone?: SortOptions;

  @SortProp()
  zone?: SortOptions;

  @SortProp()
  totalCompletedOrders?: SortOptions;

  @SortProp()
  isOnline?: SortOptions;

  @SortProp()
  status?: SortOptions;
}

export class FilterDeliverymanDTO extends PaginationParamsDTO {
  @Optional()
  @ValidateNumber()
  id?: Id;

  @Optional()
  name?: string;

  @Optional()
  @ValidateBoolean()
  isOnline?: boolean;

  @Optional()
  @ValidateEnum(DeliveryManStatus)
  status?: DeliveryManStatus;

  @Allow()
  @ApiProperty({
    type: [Object],
  })
  orderBy?: SortNeighborDTO[];

  @Optional({ example: new Date() })
  @ValidateDate()
  date?: Date;
}

export class FilterFinancialDTO extends PaginationParamsDTO {
  @Optional({ example: new Date() })
  @ValidateDate()
  date?: Date;
}

export class PhoneVerifyDTO {
  id: number;

  @ValidatePhone()
  phone: string;

  @ValidateOTP()
  otp: string;

  @Required()
  @ValidateEnum(Roles)
  role: Roles;
}
