import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export function Required(apiPropertyOptions?: ApiPropertyOptions) {
  return applyDecorators(IsNotEmpty(), ApiProperty(apiPropertyOptions));
}
