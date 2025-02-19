import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export function ValidatePhone(apiPropertyOptions?: ApiPropertyOptions) {
  return applyDecorators(
    ApiProperty({
      ...apiPropertyOptions,
      example: apiPropertyOptions?.example || '+999 999999999',
    }),
    IsString(),
    Matches(/^\+\d{1,3}\s\d{8,10}$/, {
      message: 'enter valid phone like this +999 999999999',
    }),
  );
}
