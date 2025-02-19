import { Body, Controller, Get, Patch, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ApiFilter } from 'src/decorators/api/filter.decorator';
import { Filter } from 'src/decorators/param/filter.decorator';
import { ResponseService } from 'src/globals/services/response.service';
import { SettingFilter, UpdateSettingDTO } from './dto/setting';
import { SettingsService } from './settings.service';
import { LocaleHeader } from 'src/_modules/authentication/decorators/locale.decorator';

const prefix = 'Settings';
@Controller('settings')
@ApiTags('Settings')
// @Auth({ roles: [Roles.ADMIN] })
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly responses: ResponseService,
  ) {}

  @Get(['/'])
  @ApiFilter(SettingFilter)
  async get(
    @Res() res: Response,
    @Filter({ dto: SettingFilter }) filters: SettingFilter,
    @LocaleHeader() locale: Locale,
  ) {
    const data = await this.settingsService.get(filters);
    return this.responses.success(
      res,
      locale,
      'Get Settings Successfully',
      data,
    );
  }

  @Patch('/')
  async update(
    @Res() res: Response,
    @Body() body: UpdateSettingDTO,
    @LocaleHeader() locale: Locale,
  ) {
    await this.settingsService.update(body);
    return this.responses.success(res, locale, 'update settings successfully');
  }
}
