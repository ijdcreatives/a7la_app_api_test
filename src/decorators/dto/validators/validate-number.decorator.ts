import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';

export function ValidateNumber() {
  return applyDecorators(
    ApiProperty({ type: Number }),
    Transform(({ value }) => {
      return +value;
    }),
    IsNumber(),
  );
}

export function ValidateNumberArray() {
  return applyDecorators(
    ApiProperty({ type: [Number] }),
    Transform(({ value, key }) => {
      if (Array.isArray(value)) return value.map(Number);
      if (typeof value === 'string') return value.split(',').map(Number);
      throw new Error(`Invalid Number array in ${key}`);
    }),
    IsNumber({}, { each: true }),
  );
}
