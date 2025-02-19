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
import { StoreBankService } from './bank.service';
import { AddBankDTO, UpdateBankDTO } from './dtos/bank.dto';
import { FilterBankDTO } from './dtos/filter.dto';

@Controller('store-bank')
@ApiTags('Store-Bank')
@Auth({ roles: [Roles.VENDOR] })
export class StoreBankController {
  constructor(
    private readonly storeBankService: StoreBankService,
    private readonly responses: ResponseService,
    private readonly i18nService: I18nService,
  ) {}

  @Post('/')
  async create(
    @Res() res: Response,
    @CurrentUser('storeId') storeId: Id,
    @Body() body: AddBankDTO,
    @LocaleHeader() locale: Locale,
  ) {
    if (storeId) body.storeId = storeId;
    await this.storeBankService.validateUnique(storeId, body);
    await this.storeBankService.create(body);
    return this.responses.created(res, locale, 'Bank created successfully');
  }

  @Get('/')
  @ApiFilter(FilterBankDTO)
  async getBanks(
    @Res() res: Response,
    @CurrentUser('storeId') storeId: Id,
    @Filter({ dto: FilterBankDTO }) filters: FilterBankDTO,
    @LocaleHeader() locale: Locale,
  ) {
    if (storeId) filters.storeId = storeId;
    const banks = await this.storeBankService.findAll(filters, locale);
    return this.responses.success(
      res,
      locale,
      'Banks fetched successfully',
      banks,
    );
  }

  @Patch('/:id')
  @ApiRequiredIdParam()
  async update(
    @Res() res: Response,
    @CurrentUser('storeId') storeId: Id,
    @Param() { id }: RequiredIdParam,
    @Body() body: UpdateBankDTO,
    @LocaleHeader() locale: Locale,
  ) {
    if (storeId) body.storeId = storeId;
    await this.storeBankService.update(id, body);
    return this.responses.success(res, locale, 'Bank updated successfully');
  }

  @Delete('/:id')
  @ApiRequiredIdParam()
  async delete(
    @Res() res: Response,
    @CurrentUser('storeId') storeId: Id,
    @Param() { id }: RequiredIdParam,
    @LocaleHeader() locale: Locale,
  ) {
    await this.storeBankService.delete(id, storeId);
    return this.responses.success(res, locale, 'Bank deleted successfully');
  }
}
