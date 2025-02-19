import { Body, Controller, Get, Param, Patch, Res } from '@nestjs/common';
import { ApiQuery, ApiTags, PartialType } from '@nestjs/swagger';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { Auth } from 'src/_modules/authentication/decorators/auth.decorator';
import { LocaleHeader } from 'src/_modules/authentication/decorators/locale.decorator';
import { Filter } from 'src/decorators/param/filter.decorator';
import { OptionalIdParam, RequiredIdParam } from 'src/dtos/params/id-param.dto';
import { PrismaService } from 'src/globals/services/prisma.service';
import { ResponseService } from 'src/globals/services/response.service';
import { CurrentUser } from 'src/_modules/authentication/decorators/current-user.decorator';
import { NotificationSetupService } from './notification-setup.service';
import {
  FilterNotificationSetupDTO,
  UpdateNotificationSetup,
} from './dto/notification-setup.dto';

const prefix = 'Store';

@Controller(prefix.toLowerCase())
@ApiTags('Store', 'notification-setup')
@Auth({ permissions: [prefix] })
export class NotificationSetupController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly service: NotificationSetupService,
    private readonly response: ResponseService,
  ) {}

  @Patch('/')
  async updateNotificationSetup(
    @Res() res: Response,
    @Body() body: UpdateNotificationSetup,
    @LocaleHeader() locale: Locale,
  ) {
    const { notificationId, ...restData } = body;
    await this.prisma.returnUnique(
      'storeNotificationSetup',
      'id',
      notificationId,
    );
    await this.service.updateNotificationSetup(notificationId, restData);

    return this.response.success(
      res,
      locale,
      'Notification Setup Updated Successfully',
    );
  }
  @Get('/')
  @ApiQuery({ type: PartialType(FilterNotificationSetupDTO) })
  async findNotificationSetup(
    @Res() res: Response,
    @Param() { id }: OptionalIdParam,
    @CurrentUser('storeId') storeId: Id,
    @LocaleHeader() locale: Locale,
    @Filter({ dto: FilterNotificationSetupDTO })
    filters: FilterNotificationSetupDTO,
  ) {
    if (id) await this.prisma.returnUnique('store', 'id', filters.id);
    const notificationSetup = await this.service.findNotificationSetup(
      storeId ?? filters.id,
    );
    return this.response.success(
      res,
      locale,
      'Notification Setup Fetched Successfully',

      notificationSetup,
    );
  }
}
