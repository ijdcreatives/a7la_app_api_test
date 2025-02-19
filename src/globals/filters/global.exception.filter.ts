import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { ResponseService } from 'src/globals/services/response.service';
import { Request, Response } from 'express';
import { I18nService } from 'nestjs-i18n';

@Catch()
@Injectable()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly i18n: I18nService, // Inject i18n service
    private readonly responseService: ResponseService, // Inject ResponseService
  ) {}

  async catch(exception: HttpException, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    const lang =
      request.headers['locale']?.toLocaleString().toLowerCase() || 'en'; // Get language
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      let message = exception.getResponse() as any;

      if (typeof message === 'object' && message.message) {
        message = message.message;
      }

      // If the message is an array (e.g., class-validator errors), translate each item
      let translatedMessage;
      let lang = request.headers['accept-language'] || 'en';
      if (Array.isArray(message)) {
        translatedMessage = await Promise.all(
          message.map(
            async (msg) => await this.i18n.translate(`errors.${msg}`, { lang }),
          ),
        );
      } else {
        translatedMessage = await this.i18n.translate(`errors.${message}`, {
          lang,
        });
      }

      switch (status) {
        case 500:
          this.responseService.internalServerError(
            response,
            lang as Locale,
            translatedMessage,
          );
          break;
        case 400:
          this.responseService.badRequest(
            response,
            lang as Locale,
            translatedMessage,
          );
          break;
        case 401:
          this.responseService.unauthorized(
            response,
            lang as Locale,
            translatedMessage,
          );
          break;
        case 403:
          this.responseService.forbidden(
            response,
            lang as Locale,
            translatedMessage,
          );
          break;
        case 404:
          this.responseService.notFound(
            response,
            lang as Locale,
            translatedMessage,
          );
          break;
        case 409:
          this.responseService.conflict(
            response,
            lang as Locale,
            translatedMessage,
          );
          break;
        case 412:
          this.responseService.custom(
            response,
            translatedMessage,
            exception['response']['data'],
            { code: status },
          );
          break;
        case 413:
          this.responseService.badRequest(
            response,
            lang as Locale,
            translatedMessage,
          );
          break;
        case 422:
          this.responseService.unProcessableData(
            response,
            lang as Locale,
            translatedMessage,
          );
          break;
        default:
          console.log(exception);
          break;
      }
    } else {
      console.log(exception);
      this.responseService.internalServerError(
        response,
        lang as Locale,
        'Internal server error',
      );
    }
  }
}
