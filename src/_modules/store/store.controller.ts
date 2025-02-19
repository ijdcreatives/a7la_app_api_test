import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UploadedFiles,
  Res,
} from '@nestjs/common';
import { ApiQuery, ApiTags, PartialType } from '@nestjs/swagger';
import { Roles } from '@prisma/client';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { Auth } from 'src/_modules/authentication/decorators/auth.decorator';
import { LocaleHeader } from 'src/_modules/authentication/decorators/locale.decorator';
import { uploadPath } from 'src/_modules/media/configs/upload.config';
import {
  ApiOptionalIdParam,
  ApiRequiredIdParam,
} from 'src/decorators/api/id-params.decorator';
import { UploadMultipleFiles } from 'src/decorators/api/upload-file.decorator';
import { Filter } from 'src/decorators/param/filter.decorator';
import { OptionalIdParam, RequiredIdParam } from 'src/dtos/params/id-param.dto';
import { PrismaService } from 'src/globals/services/prisma.service';
import { ResponseService } from 'src/globals/services/response.service';
import { CurrentUser } from '../authentication/decorators/current-user.decorator';
import { FilterStoreStatisticsDTO } from './dto/statistics.dto';
import {
  CreateStoreDTO,
  FilterNearestDTO,
  FilterStoreDTO,
  UpdateStoreDTO,
} from './dto/store.dto';
import { PhoneVerifyDTO } from './dto/verify.dto';
import { StoreHelperService } from './services/helper.service';
import { StoreService } from './services/store.service';
import { CurrentLocale } from '../authentication/decorators/currentLocale.decorator';

const prefix = 'Store';

@Controller(prefix.toLowerCase())
@ApiTags(prefix)
export class StoreController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storeService: StoreService,
    private readonly response: ResponseService,
    private readonly i18n: I18nService,
  ) {}

  @Post('/')
  @UploadMultipleFiles([
    {
      name: 'logo',
      maxCount: 1,
      filePath: uploadPath('image', 'store'),
      fileType: 'image',
    },

    {
      maxCount: 1,
      name: 'cover',
      filePath: uploadPath('image', 'store'),
      fileType: 'image',
    },
  ])
  @Auth({ visitor: true })
  async create(
    @Res() res: Response,
    @Body() body: CreateStoreDTO,
    @LocaleHeader() locale: Locale,
    @CurrentUser('role') role: Role,
    @UploadedFiles() files?: UploadedFile[],
  ) {
    await this.prisma.validateBody(body);
    const { vendor, ...data } = body;
    const user = StoreHelperService.createUserObject(vendor);
    const zone = body.point
      ? StoreHelperService.createZoneObject(body.nameEn, body.point)
      : undefined;
    await this.storeService.validateUnique(data, locale);
    const store = await this.storeService.create(
      user,
      zone,
      body,
      locale,
      role,
      files,
    );
    return this.response.created(res, locale, 'Store created successfully', {
      id: store.id,
      phone: store.phone,
    });
  }

  @Get('/:id/favourite')
  @Auth({})
  @ApiRequiredIdParam()
  async favoriteStore(
    @Res() res: Response,
    @Param() { id }: RequiredIdParam,
    @CurrentUser() currentUser: CurrentUser,
    @LocaleHeader() locale: Locale,
  ) {
    await this.prisma.returnUnique('store', 'id', id);
    await this.storeService.favoriteStore(id, currentUser.id);
    return this.response.success(
      res,
      locale,
      'change_store_favourite_successfully',
    );
  }

  @Get('/nearest')
  @Auth({ visitor: true })
  @ApiQuery({ type: PartialType(FilterNearestDTO) })
  async findNearest(
    @Res() res: Response,
    @LocaleHeader() locale: Locale,
    @Filter({ dto: FilterNearestDTO }) filters: FilterNearestDTO,
  ) {
    const stores = await this.storeService.findAllNearest(locale, filters);
    return this.response.success(
      res,
      locale,
      'get_nearest_stores_successfully',

      stores,
    );
  }

  @Get('/plan')
  @Auth({ roles: [Roles.VENDOR] })
  async findPlan(
    @Res() res: Response,
    @CurrentUser('storeId') storeId: Id,
    @LocaleHeader() locale: Locale,
  ) {
    const plan = await this.storeService.findPlan(storeId);
    return this.response.success(
      res,
      locale,
      'get_store_plan_successfully',

      plan,
    );
  }

  @Get('/statistics')
  @Auth({ roles: [Roles.ADMIN] })
  @ApiQuery({ type: PartialType(FilterStoreStatisticsDTO) })
  async getStatistics(
    @Res() res: Response,
    @LocaleHeader() locale: Locale,
    @Filter({ dto: FilterStoreStatisticsDTO })
    filters: FilterStoreStatisticsDTO,
  ) {
    const total = await this.storeService.storesCount(filters);

    return this.response.success(
      res,
      locale,
      'stores_count_successfully',

      total,
    );
  }

  @Get(['/', '/:id'])
  @Auth({ visitor: true })
  @ApiQuery({ type: PartialType(FilterStoreDTO) })
  @ApiOptionalIdParam()
  async findAll(
    @Res() res: Response,
    @LocaleHeader() locale: Locale,
    @Filter({ dto: FilterStoreDTO }) filters: FilterStoreDTO,
    @CurrentUser('role') role: Role,
    @CurrentUser('storeId') storeId: Id,
    @CurrentUser() currentUser: CurrentUser,
  ) {
    if (role.baseRole === Roles.VENDOR) {
      if (!filters.id) filters.id = storeId;
    }
    filters.id && (await this.prisma.returnUnique('store', 'id', filters.id));
    const { stores, total } = await this.storeService.findAll(
      locale,
      filters,
      role.baseRole,
      currentUser,
    );

    return this.response.success(
      res,
      locale,
      'stores_fetched_successfully',
      stores,
      !filters.id ? { total } : undefined,
    );
  }

  @Patch(['/', '/:id'])
  @Auth({ permissions: [prefix] })
  @UploadMultipleFiles([
    {
      name: 'logo',
      maxCount: 1,
      filePath: uploadPath('image', 'store'),
      fileType: 'image',
    },
    {
      maxCount: 1,

      name: 'cover',
      filePath: uploadPath('image', 'store'),
      fileType: 'image',
    },
  ])
  @ApiOptionalIdParam()
  async updateStore(
    @Res() res: Response,
    @Param() { id }: OptionalIdParam,
    @Body() body: UpdateStoreDTO,
    @CurrentUser('storeId') storeId: Id,
    @CurrentUser('mainStoreId') mainStoreId: Id,
    @LocaleHeader() locale: Locale,
    @UploadedFiles() files?: UploadedFile[],
  ) {
    if (!id) id = storeId;
    if (!id && !storeId) throw new BadRequestException('invalid store id');
    const bodyAfterEnhance = await this.prisma.validateBody(body);
    await this.prisma.returnUnique('store', 'id', id);
    if (body.status && storeId)
      throw new ForbiddenException('Forbidden Resources');
    await this.storeService.validateUnique(
      bodyAfterEnhance,
      locale,
      mainStoreId || storeId,
    );
    // const user = vendor ? StoreHelperService.createUserObject(vendor) : null;

    const store = await this.storeService.updateStore(
      bodyAfterEnhance as UpdateStoreDTO,
      id,
      // user,
      files,
    );

    return this.response.success(
      res,
      locale,
      'store_updated_successfully',

      store,
    );
  }

  @Delete('/:id')
  @Auth({ roles: [Roles.ADMIN], permissions: [prefix] })
  @ApiRequiredIdParam()
  async deleteStore(
    @Res() res: Response,
    @Param() { id }: RequiredIdParam,
    @LocaleHeader() locale: Locale,
  ) {
    await this.prisma.returnUnique('store', 'id', id);
    await this.storeService.deleteStore(id);
    return this.response.success(res, locale, 'store_deleted_successfully');
  }
}
