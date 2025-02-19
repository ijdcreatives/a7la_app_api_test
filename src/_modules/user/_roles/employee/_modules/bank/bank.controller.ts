import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '@prisma/client';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { Auth } from 'src/_modules/authentication/decorators/auth.decorator';
import { CurrentUser } from 'src/_modules/authentication/decorators/current-user.decorator';
import { LocaleHeader } from 'src/_modules/authentication/decorators/locale.decorator';
import { ApiFilter } from 'src/decorators/api/filter.decorator';
import { ApiRequiredIdParam } from 'src/decorators/api/id-params.decorator';
import { Filter } from 'src/decorators/param/filter.decorator';
import { RequiredIdParam } from 'src/dtos/params/id-param.dto';
import { ResponseService } from 'src/globals/services/response.service';
import { DeliveryBankService } from './bank.service';
import { AddBankDTO, UpdateBankDTO } from './dtos/bank.dto';
import { FilterBankDTO } from './dtos/filter.dto';

@Controller('delivery-bank')
@ApiTags('Delivery-Bank')
@Auth({ roles: [Roles.DELIVERY] })
export class DeliveryBankController {
  constructor(
    private readonly deliveryBankService: DeliveryBankService,
    private readonly responses: ResponseService,
    private readonly i18nService: I18nService,
  ) {}

  @Post('/')
  async create(
    @Res() res: Response,
    @CurrentUser() currentUser: CurrentUser,
    @Body() body: AddBankDTO,
    @LocaleHeader() locale: Locale,
  ) {
    body.deliveryManId = currentUser.id;
    await this.deliveryBankService.validateUnique(currentUser.id, body);
    await this.deliveryBankService.create(body);
    return this.responses.created(res, locale, 'Account Created Successfully');
  }

  @Get('/')
  @ApiFilter(FilterBankDTO)
  async getBanks(
    @Res() res: Response,
    @CurrentUser() currentUser: CurrentUser,
    @Filter({ dto: FilterBankDTO }) filters: FilterBankDTO,
    @LocaleHeader() locale: Locale,
  ) {
    filters.deliveryManId = currentUser.id;
    const banks = await this.deliveryBankService.findAll(filters, locale);
    return this.responses.success(
      res,
      locale,
      'Fetched Accounts Successfully',
      locale,
    );
  }

  @Patch('/:id')
  @ApiRequiredIdParam()
  async update(
    @Res() res: Response,
    @CurrentUser() currentUser: CurrentUser,
    @Param() { id }: RequiredIdParam,
    @Body() body: UpdateBankDTO,
    @LocaleHeader() locale: Locale,
  ) {
    body.deliveryManId = currentUser.id;
    await this.deliveryBankService.update(id, body);
    return this.responses.success(res, locale, 'Account Updated Successfully');
  }

  @Delete('/:id')
  @ApiRequiredIdParam()
  async delete(
    @Res() res: Response,
    @CurrentUser() currentUser: CurrentUser,
    @Param() { id }: RequiredIdParam,
    @LocaleHeader() locale: Locale,
  ) {
    await this.deliveryBankService.delete(id, currentUser.id);
    return this.responses.success(res, locale, 'Account Deleted Successfully');
  }
}
