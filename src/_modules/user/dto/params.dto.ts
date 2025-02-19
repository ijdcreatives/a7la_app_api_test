import { Roles } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
import { OptionalIdParam } from 'src/dtos/params/id-param.dto';

export class RoleOrIdParam extends OptionalIdParam {
  @IsOptional()
  @Transform(({ value }) => value.toUpperCase())
  @IsEnum(Roles)
  role: Roles;
}

export class RoleParam {
  @Transform(({ value }) => value.toUpperCase())
  @IsEnum(Roles)
  role: Roles;
}
