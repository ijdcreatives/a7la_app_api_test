import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export function ValidatePassword(apiPropertyOptions?: ApiPropertyOptions) {
  return applyDecorators(
    ApiProperty({
      ...apiPropertyOptions,
      example: apiPropertyOptions?.example || 'Default@123',
    }),
    IsString(),
  );
}
