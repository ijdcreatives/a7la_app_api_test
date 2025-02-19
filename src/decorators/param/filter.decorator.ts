import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { ClassConstructor, plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { globalValidationPipeOptions } from 'src/configs/pipes.config';

export const Filter = createParamDecorator(
  async (
    _: { key?: string; dto?: ClassConstructor<object> },
    ctx: ExecutionContext,
  ) => {
    const request = ctx.switchToHttp().getRequest();
    const body = request.body || {};
    const query = request.query || {};
    const params = request.params || {};

    const merged = {};

    const mergeValues = (source: object, target: object) => {
      for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          if (!Array.isArray(target[key]))
            target[key] = target[key] ? [target[key]] : [];

          if (Array.isArray(source[key])) {
            if (Array.isArray(target[key])) {
              target[key] = [...new Set([...target[key], ...source[key]])];
            } else if (target[key] !== undefined) {
              target[key] = [...new Set([target[key], ...source[key]])];
            } else {
              target[key] = [...source[key]];
            }
          } else {
            if (Array.isArray(target[key])) {
              target[key] = [...new Set([...target[key], source[key]])];
            } else if (target[key] !== undefined) {
              target[key] = [...new Set([target[key], source[key]])];
            } else {
              target[key] = source[key];
            }
          }
        }
      }
    };
    mergeValues(query, merged);
    mergeValues(body, merged);
    mergeValues(params, merged);

    if (_.dto) {
      const transformed = plainToClass(_.dto, merged);
      const errors = await validate(transformed, globalValidationPipeOptions);
      if (errors.length > 0) {
        const errorMessage = errors
          .map((error) => Object.values(error.constraints))
          .join(', ');

        throw new BadRequestException(errorMessage);
      }
      return transformed;
    }

    if (_.key) return merged[_.key];
    return merged;
  },
);
