import { IsString } from 'class-validator';
import { Required } from './required-input.decorator';

export class NameDTO {
  @Required()
  @IsString()
  nameAr: string;

  @Required()
  @IsString()
  nameEn: string;
}
