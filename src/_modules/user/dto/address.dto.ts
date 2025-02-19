import { PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean } from 'class-validator';
import { Optional } from 'src/decorators/dto/optional-input.decorator';
import { Required } from 'src/decorators/dto/required-input.decorator';

export class AddAddressDTO {
  @Required({})
  title: string;

  @Required({})
  lat: number;

  @Required({})
  lng: number;
}
export class UpdateAddressDTO extends PartialType(AddAddressDTO) {
  @Required({})
  @Transform(({ value }) => Number(value))
  addressId: Id;

  @Optional()
  @IsBoolean()
  default: boolean;
}

export class DeleteAddressDTO {
  @Required({})
  @Transform(({ value }) => Number(value))
  addressId: Id;
}
export class AddCarDeliveryDTO {
  @Required({})
  car: string;

  @Required({})
  model: string;

  @Required({})
  color: string;

  @Required({})
  plate: string;

  @Required({})
  license: string;
}

export class updateCarDeliveryDto extends PartialType(AddCarDeliveryDTO) {
  @Required({})
  @Transform(({ value }) => Number(value))
  carId: Id;
}
