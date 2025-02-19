import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { Days, NotificationSetupStatus, StoreStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { Transform, Type } from 'class-transformer';
import {
  Allow,
  IsBoolean,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  IsStrongPassword,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { Optional } from 'src/decorators/dto/optional-input.decorator';
import { Required } from 'src/decorators/dto/required-input.decorator';
import { SortProp } from 'src/decorators/dto/sort-prop.decorator';
import { ValidateBoolean } from 'src/decorators/dto/validators/validate-boolean.decorator';
import { ValidateObject } from 'src/decorators/dto/validators/validate-nested.decorator';
import { ValidateNumber } from 'src/decorators/dto/validators/validate-number.decorator';
import { ValidatePhone } from 'src/decorators/dto/validators/validate-phone.decorator';
import { ValidateString } from 'src/decorators/dto/validators/validate-string.decorator';
import { ValidateTime } from 'src/decorators/dto/validators/validate-time.decorator';
import { EnumArrayFilter } from 'src/decorators/filters/enum.filter.decorator';
import { PaginationParamsDTO } from 'src/dtos/params/pagination-params.dto';
import { CreateScheduleDTO } from '../_modules/schedule/dto/schedule.dto';
import { NameDTO } from 'src/decorators/dto/name.dto';
import { CreateVendorDTO } from 'src/_modules/user/_roles/vendor/dto/vendor.dto';

export class PointDTO {
  @Required({ example: 20.5 })
  lat: Decimal;

  @Required({ example: 20.5 })
  lng: Decimal;
}

export class CreateStoreDTO extends NameDTO {
  @Required({})
  address: string;

  @Required({ type: CreateVendorDTO })
  @ValidateObject(CreateVendorDTO)
  vendor: CreateVendorDTO;

  @Required({})
  @ValidatePhone()
  phone: string;

  @Required({})
  @ValidateNumber()
  moduleId: Id;

  @Optional({})
  @ValidateNumber()
  @Min(0)
  @Max(100)
  tax: number;

  @Optional()
  @ValidateNumber()
  @Min(0)
  minDeliveryTime?: number;

  @Optional()
  @ValidateNumber()
  @Min(10)
  maxDeliveryTime?: number;

  @Required()
  @ApiProperty({ required: true, type: Number })
  @ValidateNumber()
  cityId: Id;

  @ApiProperty({ type: String, format: 'binary', required: true })
  logo: string;

  @ApiProperty({ type: String, format: 'binary', required: true })
  cover: string;

  @Optional()
  @ValidateObject(PointDTO)
  point?: PointDTO;

  @Optional()
  @ValidateNumber()
  zoneId?: Id;
}

export class UpdateStoreDTO extends OmitType(PartialType(CreateStoreDTO), [
  'vendor',
]) {
  @Optional()
  @EnumArrayFilter(StoreStatus, 'Store Status', 'Choose store status')
  status?: StoreStatus;

  @Optional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isRecommended?: boolean;

  @Optional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  temporarilyClosed?: boolean;

  @Optional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  minimumOrderAmount?: number;

  @Optional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  minDeliveryTime?: number;

  @Optional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  maxDeliveryTime?: number;

  @Optional()
  @ValidatePhone()
  phone?: string;

  @Optional()
  days: CreateScheduleDTO;
}
export enum SortOption {
  ASC = 'asc',
  DESC = 'desc',
}

export class SortNeighborDTO {
  @SortProp()
  id?: SortOptions;

  @SortProp()
  nameAr?: SortOptions;

  @SortProp()
  nameEn?: SortOptions;

  @SortProp()
  owner?: SortOptions;

  @SortProp()
  zone?: SortOptions;

  @SortProp()
  fasterDelivery?: SortOptions;

  @SortProp()
  orders?: SortOptions;

  @SortProp()
  nearest?: SortOptions;

  @SortProp()
  status?: SortOptions;
}

export class FilterStoreDTO extends PaginationParamsDTO {
  @ApiProperty()
  @IsOptional()
  @Transform(({ value }) => +value)
  id?: Id;

  @ApiProperty()
  @IsOptional()
  name?: string;

  @Optional()
  @Transform(({ value }) => value[0] === 'true')
  @IsBoolean()
  favorite?: boolean;

  @Optional()
  @Transform(({ value }) => value[0] === 'true')
  @IsBoolean()
  freeDelivery?: boolean;

  @Optional()
  @ValidateBoolean()
  isOffer?: boolean;

  @Optional()
  @ValidateBoolean()
  homeDelivery?: boolean;

  @Optional()
  @ValidateBoolean()
  takeAway?: boolean;

  @Optional()
  @ValidateBoolean()
  carDelivery?: boolean;

  @Optional()
  @Transform(({ value }) => value[0] === 'true')
  @IsBoolean()
  campaign?: boolean;

  @Optional()
  @Transform(({ value }) => +value)
  @IsNumber()
  zoneId?: Id;

  @Optional()
  @Transform(({ value }) => +value)
  @IsNumber()
  moduleId?: Id;

  @Optional()
  @Transform(({ value }) => +value)
  @IsNumber()
  categoryId?: Id;

  @Optional()
  @Transform(({ value }) => +value)
  @IsNumber()
  lat?: number;

  @Optional()
  @Transform(({ value }) => +value)
  @IsNumber()
  lng?: number;

  @Optional()
  @EnumArrayFilter(StoreStatus, 'Store Status', 'Choose store status')
  status?: StoreStatus[];

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

  @ApiProperty()
  @IsOptional()
  owner?: string;
}

export class FilterNearestDTO {
  @Required({})
  @Transform(({ value }) => +value)
  @IsNumber()
  lat: number;

  @Required({})
  @Transform(({ value }) => +value)
  @IsNumber()
  lng: number;

  @Optional()
  @Transform(({ value }) => +value)
  @IsNumber()
  radiusTake?: number;

  @Optional()
  @Transform(({ value }) => +value)
  @IsNumber()
  radiusLimit?: number;
}

export class SwitchPlanDTO {
  @Required()
  @Transform((value) => +value)
  planId: Id;
}
