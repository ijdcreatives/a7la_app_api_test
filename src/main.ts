import './declares';
// organize-imports-disable-above
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import { AppModule } from './app/app.module';
import { corsConfig } from './configs/cors.config';
import { globalValidationPipeOptions } from './configs/pipes.config';
import { swaggerConfig } from './configs/swagger.config';
import { GlobalExceptionFilter } from './globals/filters/global.exception.filter';
import { I18nService } from 'nestjs-i18n';
import { ResponseService } from './globals/services/response.service';

const environment = env('NODE_ENV') || 'development';
const envFileName = environment == 'production' ? '.env.prod' : '.env';
config({ path: envFileName, override: true });

async function bootstrap() {
  //
  const app = await NestFactory.create(AppModule, {
    cors: corsConfig,
    logger: environment !== 'production' ? ['error', 'warn', 'log'] : false,
  });
  const port = +env('PORT') || 3000;

  app.use(cookieParser(env('COOKIE_SECRET'), {}));
  const i18nService =
    app.get<I18nService<Record<string, unknown>>>(I18nService);
  const responseService = app.get(ResponseService);

  const prefix = env('API_PREFIX') || '';

  app.setGlobalPrefix(prefix);

  app.useGlobalFilters(new GlobalExceptionFilter(i18nService, responseService));

  app.useGlobalPipes(new ValidationPipe(globalValidationPipeOptions));

  swaggerConfig(app);

  await app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.info(`server is running on port ${port}`);
    // eslint-disable-next-line no-console
    console.info(
      `Swagger is running on http://localhost:${port}${prefix}/docs`,
    );
  });
}
bootstrap();
