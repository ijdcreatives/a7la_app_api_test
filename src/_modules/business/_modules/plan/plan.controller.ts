import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import { ApiQuery, ApiTags, PartialType } from '@nestjs/swagger';
import { Roles } from '@prisma/client';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { Auth } from 'src/_modules/authentication/decorators/auth.decorator';
import { CurrentUser } from 'src/_modules/authentication/decorators/current-user.decorator';
import { LocaleHeader } from 'src/_modules/authentication/decorators/locale.decorator';
import { ApiRequiredIdParam } from 'src/decorators/api/id-params.decorator';
import { Filter } from 'src/decorators/param/filter.decorator';
import { RequiredIdParam } from 'src/dtos/params/id-param.dto';
import { PaginationParamsDTO } from 'src/dtos/params/pagination-params.dto';
import { PrismaService } from 'src/globals/services/prisma.service';
import { ResponseService } from 'src/globals/services/response.service';
import { CreatePlanDTO, FilterPlanDTO, UpdatePlanDTO } from './dto/plan.dto';
import { PlanService } from './service/plan.service';

const prefix = 'Plan';

@Controller(prefix.toLowerCase())
@ApiTags(prefix)
export class PlanController {
  constructor(
    private readonly service: PlanService,
    private readonly responseService: ResponseService,
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  @Post('/:id/subscribe')
  @ApiRequiredIdParam()
  @Auth({ roles: [Roles.VENDOR], permissions: [prefix] })
  async subscribe(
    @Res() res: Response,
    @Param() { id }: RequiredIdParam,
    @CurrentUser('storeId') storeId: Id,
    @CurrentUser('mainStoreId') mainStoreId: Id,
    @LocaleHeader() locale: Locale,
  ) {
    await this.prisma.returnUnique('plan', 'id', id);
    await this.service.subscribe(id, mainStoreId || storeId, locale);
    return this.responseService.created(res, locale, 'Subscribed Successfully');
  }

  @Post('/:id/renew')
  @ApiRequiredIdParam()
  @Auth({ roles: [Roles.VENDOR], permissions: [prefix] })
  async renew(
    @Res() res: Response,
    @Param() { id }: RequiredIdParam,
    @CurrentUser('storeId') storeId: Id,
    @CurrentUser('mainStoreId') mainStoreId: Id,
    @LocaleHeader() locale: Locale,
  ) {
    await this.prisma.returnUnique('plan', 'id', id);
    await this.service.renew(id, mainStoreId || storeId, locale);
    return this.responseService.created(res, locale, 'Renewed Successfully');
  }

  @Post('/')
  @Auth({ roles: [Roles.ADMIN] })
  async create(
    @Res() res: Response,
    @Body() body: CreatePlanDTO,
    @LocaleHeader() locale: Locale,
  ) {
    await this.prisma.validateBody(body);
    await this.service.create(body);
    return this.responseService.created(res, locale, 'Created Successfully');
  }

  @Get(['/subscriber-statistics'])
  @Auth({ roles: [Roles.ADMIN] })
  async findSubscriberStatistics(
    @Res() res: Response,
    @LocaleHeader() locale: Locale,
  ) {
    const data = await this.service.findSubscriberStatistics();
    return this.responseService.success(
      res,
      locale,
      'Subscriber Statistics Fetched Successfully',

      data,
    );
  }

  @Get(['/subscriber'])
  @ApiQuery({ type: PartialType(PaginationParamsDTO) })
  @Auth({ roles: [Roles.ADMIN] })
  async findSubscriber(
    @Res() res: Response,
    @LocaleHeader() locale: Locale,
    @Filter({ dto: PaginationParamsDTO }) filters: PaginationParamsDTO,
  ) {
    const data = await this.service.findSubscriber(filters, locale);
    return this.responseService.success(
      res,
      locale,
      'Subscriber Fetched Successfully',

      data,
    );
  }

  @Get(['/'])
  @ApiQuery({ type: PartialType(FilterPlanDTO) })
  @Auth({ roles: [Roles.ADMIN, Roles.VENDOR] })
  async findAll(
    @Res() res: Response,
    @LocaleHeader() locale: Locale,
    @Filter({ dto: FilterPlanDTO }) filters: FilterPlanDTO,
    @CurrentUser('role') role: Role,
  ) {
    const zones = await this.service.findAll(locale, filters, role);
    return this.responseService.success(
      res,
      locale,
      'Plan Fetched Successfully',

      zones,
    );
  }

  @Patch('/:id')
  @Auth({
    roles: [Roles.ADMIN],
  })
  @ApiRequiredIdParam()
  async update(
    @Res() res: Response,
    @Param() { id }: RequiredIdParam,
    @Body() body: UpdatePlanDTO,
    @LocaleHeader() locale: Locale,
  ) {
    await this.prisma.returnUnique('plan', 'id', id);

    await this.service.update(id, body);

    return this.responseService.success(
      res,
      locale,
      'Plan Updated Successfully',
    );
  }

  @Delete('/:id')
  @Auth({
    roles: [Roles.ADMIN],
  })
  @ApiRequiredIdParam()
  async deletePlan(
    @Res() res: Response,
    @Param() { id }: RequiredIdParam,
    @LocaleHeader() locale: Locale,
  ) {
    const plan = await this.prisma.returnUnique('plan', 'id', id);
    if (plan.price === 0) {
      throw new ForbiddenException(
        this.i18n.translate('can_t_delete_this_plan', { lang: locale }),
      );
    }
    await this.service.delete(id);

    return this.responseService.success(
      res,
      locale,
      'Plan Deleted Successfully',
    );
  }
}
