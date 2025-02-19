import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined, IsNotEmptyObject, IsString } from 'class-validator';
import { PointDTO } from 'src/_modules/store/dto/store.dto';
import { CreateVendorDTO } from 'src/_modules/user/_roles/vendor/dto/vendor.dto';
import { Nested } from 'src/decorators/dto/nested.decorator';
import { Optional } from 'src/decorators/dto/optional-input.decorator';
import { Required } from 'src/decorators/dto/required-input.decorator';
import { ValidateNumber } from 'src/decorators/dto/validators/validate-number.decorator';
import { ValidatePhone } from 'src/decorators/dto/validators/validate-phone.decorator';
import { PaginationParamsDTO } from 'src/dtos/params/pagination-params.dto';

export class CreateBranchDTO {
  @Required({})
  @IsString()
  address: string;

  @Required({})
  branchName: string;

  @Optional()
  @IsDefined()
  @IsNotEmptyObject()
  @Type(() => CreateVendorDTO)
  @Nested(CreateVendorDTO)
  vendor!: CreateVendorDTO;

  @Required({})
  @ValidatePhone()
  phone: string;

  @Required()
  @ApiProperty({ required: true, type: Number })
  @ValidateNumber()
  cityId: Id;

  @Optional()
  @Type(() => PointDTO)
  @Nested(PointDTO)
  point?: PointDTO;

  @Optional()
  @ValidateNumber()
  zoneId?: Id;

  default?: boolean;
}

export class UpdateBranchDTO extends PartialType(CreateBranchDTO) {}

export class FilterBranchDTO extends PartialType(PaginationParamsDTO) {}
