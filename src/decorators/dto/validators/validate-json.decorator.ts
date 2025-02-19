import { applyDecorators, BadRequestException } from '@nestjs/common';
import { Transform } from 'class-transformer';

export function ValidateJson() {
  return applyDecorators(
    Transform(({ value, key }) => {
      let val;
      if (typeof value === 'object') return value;

      try {
        val = JSON.parse(value);
      } catch (_) {
        throw new BadRequestException(`errors.invalidStringifiedJson ${key}`, {
          cause: { field: key },
        });
      }

      return val;
    }),
  );
}
