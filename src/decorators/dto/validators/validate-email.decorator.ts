import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export function ValidateEmail(apiPropertyOptions?: ApiPropertyOptions) {
  return applyDecorators(
    ApiProperty({
      ...apiPropertyOptions,
      example: apiPropertyOptions?.example || 'fhakem75@gmail.com',
    }),
    IsEmail(),
  );
}
