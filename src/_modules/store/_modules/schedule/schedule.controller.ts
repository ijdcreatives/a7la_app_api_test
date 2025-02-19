import { Body, Controller, Delete, Param, Post, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Auth } from 'src/_modules/authentication/decorators/auth.decorator';
import { LocaleHeader } from 'src/_modules/authentication/decorators/locale.decorator';
import { OptionalIdParam, RequiredIdParam } from 'src/dtos/params/id-param.dto';
import { PrismaService } from 'src/globals/services/prisma.service';
import { ResponseService } from 'src/globals/services/response.service';
import { CurrentUser } from 'src/_modules/authentication/decorators/current-user.decorator';
import {
  ApiOptionalIdParam,
  ApiRequiredIdParam,
} from 'src/decorators/api/id-params.decorator';
import { CreateScheduleDTO } from './dto/schedule.dto';
import { ScheduleService } from './schedule.service';

const prefix = 'Schedule';

@Controller(prefix.toLowerCase())
@ApiTags('Store', prefix)
@Auth({ permissions: [prefix] })
export class ScheduleController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly service: ScheduleService,
    private readonly response: ResponseService,
  ) {}

  @Post(['/', '/:id'])
  @ApiOptionalIdParam()
  async createSchedule(
    @Res() res: Response,
    @Param() { id }: OptionalIdParam,
    @Body() body: CreateScheduleDTO,
    @CurrentUser('storeId') storeId: Id,
    @LocaleHeader() locale: Locale,
  ) {
    if (!storeId && !id)
      return this.response.badRequest(res, locale, 'invalid store id');
    else id = storeId;

    await this.prisma.returnUnique('store', 'id', id);
    await this.service.scheduleExist(id, body, locale);

    const schedule = await this.service.createSchedule(id, body, locale);

    return this.response.created(
      res,
      locale,
      'Schedule Created Successfully',

      schedule,
    );
  }

  @Delete('/:id')
  @Auth({ permissions: [prefix] })
  @ApiRequiredIdParam()
  async deleteSchedule(
    @Res() res: Response,
    @Param() { id }: RequiredIdParam,
    @LocaleHeader() locale: Locale,
  ) {
    await this.prisma.returnUnique('storeSchedule', 'id', id);
    await this.service.deleteSchedule(id);
    return this.response.success(res, locale, 'Schedule Deleted Successfully');
  }
}
