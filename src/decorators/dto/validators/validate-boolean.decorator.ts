import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { isArray, IsBoolean } from 'class-validator';

export function toBoolean(value: string | number | boolean): boolean {
  if (typeof value === 'boolean') return value;

  if (typeof value === 'string') {
    value = value.toLowerCase();
    if (value === 'true' || value === '1') {
      return true;
    } else if (value === 'false' || value === '0') {
      return false;
    } else return undefined;
  } else if (typeof value === 'number') {
    return value !== 0;
  } else return undefined;
}

export function ValidateBoolean() {
  return applyDecorators(
    ApiProperty({ type: Boolean, example: new Boolean() }),
    Transform(({ value }) => {
      if (isArray(value)) {
        value = toBoolean(value[0]);
      } else {
        value = toBoolean(value);
      }
      return value;
    }),
    IsBoolean(),
  );
}
