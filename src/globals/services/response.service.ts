import { HttpStatus, Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';

type ResOptions = {
  total?: number;
  code?: number;
  dashboardOptions?: any;
};

@Injectable()
export class ResponseService {
  constructor(private readonly i18n: I18nService) {}

  custom(response: Response, message, data?: any, options: ResOptions = {}) {
    const { code, ...restOptions } = options;
    return response.status(code || HttpStatus.OK).json({
      message,
      data,
      ...restOptions,
    });
  }

  success<Type>(
    response: Response,
    locale: Locale,
    messageKey: string,
    data?: Type | Type[] | null,
    options: ResOptions = {},
  ) {
    const { code, ...restOptions } = options;
    response.status(code || HttpStatus.OK).json({
      message: this.i18n.translate(`response.${messageKey}`, {
        lang: locale,
      }),
      data,
      ...restOptions,
    });
  }

  created(
    response: Response,
    locale: Locale,
    messageKey: string,
    data?: object,
    options: ResOptions = {},
  ) {
    response.status(HttpStatus.CREATED).json({
      message: this.i18n.translate(`response.${messageKey}`, {
        lang: locale,
      }),
      data,
      ...options,
    });
  }

  forbidden(
    response: Response,
    locale: Locale,
    messageKey: string,
    options: ResOptions = {},
  ) {
    return response.status(HttpStatus.FORBIDDEN).json({
      message: this.i18n.translate(`response.${messageKey}`, {
        lang: locale,
      }),
      ...options,
    });
  }

  conflict(
    response: Response,
    locale: Locale,
    messageKey: string,
    data?: object,
    options: ResOptions = {},
  ) {
    return response.status(HttpStatus.CONFLICT).json({
      message: this.i18n.translate(`response.${messageKey}`, {
        lang: locale,
      }),
      data,
      ...options,
    });
  }

  notFound(
    response: Response,
    locale: Locale,
    messageKey: string,
    options: ResOptions = {},
  ) {
    return response.status(HttpStatus.NOT_FOUND).json({
      message: this.i18n.translate(`response.${messageKey}`, {
        lang: locale,
      }),
      ...options,
    });
  }

  internalServerError(
    response: Response,
    locale: Locale,
    messageKey: string,
    options: ResOptions = {},
  ) {
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: this.i18n.translate(`response.${messageKey}`, {
        lang: locale,
      }),
      ...options,
    });
  }

  unauthorized(
    response: Response,
    locale: Locale,
    messageKey: string,
    options: ResOptions = {},
  ) {
    return response.status(HttpStatus.UNAUTHORIZED).json({
      message: this.i18n.translate(`response.${messageKey}`, {
        lang: locale,
      }),
      ...options,
    });
  }

  badRequest(
    response: Response,
    locale: Locale,
    messageKey: string,
    options: ResOptions = {},
  ) {
    return response.status(HttpStatus.BAD_REQUEST).json({
      message: this.i18n.translate(`response.${messageKey}`, {
        lang: locale,
      }),
      ...options,
    });
  }

  unProcessableData(
    response: Response,
    locale: Locale,
    messageKey: string,
    options: ResOptions = {},
  ) {
    return response.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
      message: this.i18n.translate(`response.${messageKey}`, {
        lang: locale,
      }),
      ...options,
    });
  }
}
