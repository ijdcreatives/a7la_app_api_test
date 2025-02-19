import { IsLatLong } from 'class-validator';

export class UserLocationDTO {
  @IsLatLong()
  latLong: string;
}
