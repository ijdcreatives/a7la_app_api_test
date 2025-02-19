import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthenticationModule } from 'src/_modules/authentication/authentication.module';

import { ScheduleModule } from '@nestjs/schedule';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import { join } from 'path';
import { AuthorizationModule } from 'src/_modules/authorization/authorization.module';
import { ChatModule } from 'src/_modules/chat/chat.module';
import { DeliveryModule } from 'src/_modules/user/_roles/deliveryman/delivery.module';
import { UserModule } from 'src/_modules/user/user.module';
import { GlobalModule } from 'src/globals/global.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StoreModule } from 'src/_modules/store/store.module';
import { ModulesModule } from 'src/_modules/modules/modules.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),

    I18nModule.forRootAsync({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
      ],
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage: configService.getOrThrow('FALLBACK_LANGUAGE'),
        loaderOptions: {
          path: join(__dirname, '../i18n/'),
          watch: true,
        },
      }),
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
        new HeaderResolver(['x-lang', 'local-lang']),
      ],
      inject: [ConfigService],
    }),
    UserModule,
    AuthenticationModule,
    AuthorizationModule,
    GlobalModule,
    StoreModule,
    DeliveryModule,
    ModulesModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly service: AppService) {}

  async onModuleInit() {
    if (env('SYNCABLE') !== 'TRUE') return;
    await this.service.syncSettings();
  }
}
