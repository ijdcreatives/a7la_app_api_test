import { Body, Controller, Get, Param, Patch, Post, Res } from '@nestjs/common';
import { ApiQuery, ApiTags, PartialType } from '@nestjs/swagger';
import { Roles } from '@prisma/client';
import { Response } from 'express';
import { Auth } from 'src/_modules/authentication/decorators/auth.decorator';
import { LocaleHeader } from 'src/_modules/authentication/decorators/locale.decorator';
import { ApiRequiredIdParam } from 'src/decorators/api/id-params.decorator';
import { Filter } from 'src/decorators/param/filter.decorator';
import { RequiredIdParam } from 'src/dtos/params/id-param.dto';
import { PrismaService } from 'src/globals/services/prisma.service';
import { ResponseService } from 'src/globals/services/response.service';
import { CurrentUser } from '../../../authentication/decorators/current-user.decorator';
import {
  CreateWithdrawDTO,
  FilterWithdrawDTO,
  UpdateWithdrawDTO,
} from './dto/withdraw.dto';
import { WithdrawService } from './services/withdraw.service';

const prefix = 'Withdraw';

@Controller(prefix.toLowerCase())
@ApiTags(prefix)
export class WithdrawController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly service: WithdrawService,
    private readonly responseService: ResponseService,
  ) {}

  @Post('/')
  @Auth({
    roles: [Roles.VENDOR, Roles.DELIVERY, Roles.MANAGER],
  })
  async create(
    @Res() res: Response,
    @Body() body: CreateWithdrawDTO,
    @CurrentUser('storeId') storeId: Id,
    @CurrentUser() currentUser: CurrentUser,
    @CurrentUser('role') role: Role,
    @LocaleHeader() locale: Locale,
  ) {
    if (role.baseRole === Roles.DELIVERY) {
      storeId = undefined;
      body.storeAccountId = undefined;
      await this.prisma.returnUnique(
        'deliveryBank',
        'id',
        body.deliveryAccountId,
      );
    }
    if (role.baseRole === Roles.VENDOR) {
      currentUser.id = undefined;
      body.deliveryAccountId = undefined;
      await this.prisma.returnUnique('storeBank', 'id', body.storeAccountId);
    }

    await this.prisma.validateBody(body);
    await this.service.create(body, storeId, currentUser.id);
    return this.responseService.created(
      res,
      locale,
      'withdraw_created_successfully',
    );
  }

  @Patch('/:id')
  @Auth({
    roles: [Roles.ADMIN],
  })
  @ApiRequiredIdParam()
  async updateReview(
    @Res() res: Response,
    @Body() body: UpdateWithdrawDTO,
    @Param() { id }: RequiredIdParam,
    @LocaleHeader() locale: Locale,
  ) {
    await this.prisma.returnUnique('withdraw', 'id', id);
    await this.service.update(id, body);
    return this.responseService.created(
      res,
      locale,
      'withdraw_updated_successfully',
    );
  }

  @Get(['/', '/:id'])
  @Auth({
    roles: [Roles.VENDOR, Roles.DELIVERY, Roles.MANAGER, Roles.ADMIN],
  })
  @ApiQuery({ type: PartialType(FilterWithdrawDTO) })
  async findAll(
    @Res() res: Response,
    @LocaleHeader() locale: Locale,
    @CurrentUser('role') role: Role,
    @CurrentUser('storeId') storeId: Id,
    @CurrentUser() currentUser: CurrentUser,
    @Filter({ dto: FilterWithdrawDTO }) filters: FilterWithdrawDTO,
  ) {
    if (role.baseRole === Roles.VENDOR) filters.storeId = storeId;
    else if (role.baseRole === Roles.DELIVERY) {
      filters.deliveryManId = currentUser.id;
    }

    const { withdraws, total } = await this.service.findAll(locale, filters);

    return this.responseService.success(
      res,
      locale,
      'withdraws_fetched_successfully',

      withdraws,
      { total },
    );
  }
}
