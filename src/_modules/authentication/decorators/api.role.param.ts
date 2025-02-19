import { applyDecorators } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';
import { Roles } from '@prisma/client';

export function RoleParam() {
  return applyDecorators(ApiParam({ enum: Roles, name: 'role' }));
}
