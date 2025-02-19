import { applyDecorators } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';

export function ApiOptionalIdParam(name = 'id') {
  return applyDecorators(ApiParam({ name, type: String, required: false }));
}

export function ApiRequiredIdParam(name = 'id') {
  return applyDecorators(ApiParam({ name, type: String, required: true }));
}
