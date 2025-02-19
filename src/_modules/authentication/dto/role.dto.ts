import { ApiProperty } from '@nestjs/swagger';
import { Roles } from '@prisma/client';
import { Required } from 'src/decorators/dto/required-input.decorator';

export class RoleDto {
  @Required()
  @ApiProperty({ enum: Roles })
  role: Roles;
}
