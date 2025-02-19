import { ApiProperty } from '@nestjs/swagger';
import { Roles } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class UserFiltrationDTO {
  @ApiProperty({ example: [1, 2, 3] })
  @IsOptional()
  @Transform(({ value }) => value.map((id: any) => +id))
  @IsNumber({}, { each: true })
  id?: Id[];

  @ApiProperty({ example: 'Fahd' })
  @IsOptional()
  @IsString({ each: true })
  firstName?: string[];

  @ApiProperty({ example: 'Hakim' })
  @IsOptional()
  @IsString({ each: true })
  lastName?: string[];

  @ApiProperty({ example: ['01159675941'] })
  @IsOptional()
  @IsString({ each: true })
  phone?: string[];

  @IsOptional()
  @ValidateNested({ each: true })
  @IsEnum(Roles, { each: true })
  role?: Roles[];

  @ApiProperty({ example: { gt: 22, lt: 30 } })
  @IsOptional()
  @IsObject({})
  age?: { gt?: number; lt?: number };
}
