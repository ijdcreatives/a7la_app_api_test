import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  Res,
} from '@nestjs/common';
import { ApiQuery, ApiTags, PartialType } from '@nestjs/swagger';
import { Roles } from '@prisma/client';
import { Response } from 'express';
import { Auth } from 'src/_modules/authentication/decorators/auth.decorator';
import { CurrentUser } from 'src/_modules/authentication/decorators/current-user.decorator';
import { LocaleHeader } from 'src/_modules/authentication/decorators/locale.decorator';
import { uploadPath } from 'src/_modules/media/configs/upload.config';
import {
  ApiOptionalIdParam,
  ApiRequiredIdParam,
} from 'src/decorators/api/id-params.decorator';
import { UploadMultipleFiles } from 'src/decorators/api/upload-file.decorator';
import { Filter } from 'src/decorators/param/filter.decorator';
import { OptionalIdParam, RequiredIdParam } from 'src/dtos/params/id-param.dto';
import { createWithId } from 'src/globals/helpers/dtoWithId';
import { PrismaService } from 'src/globals/services/prisma.service';
import { ResponseService } from 'src/globals/services/response.service';
import {
  CreateDeliverymanDto,
  FilterDeliverymanDTO,
  PhoneVerifyDTO,
  UpdateDeliverymanDTO,
} from './dto/delivery.dto';
import { DeliveryService } from './services/delivery.service';

const prefix = 'Delivery';
@ApiTags('Delivery')
@Controller(prefix.toLowerCase())
export class DeliveryController {
  constructor(
    private readonly service: DeliveryService,
    private readonly prisma: PrismaService,
    private readonly response: ResponseService,
  ) {}

  // @Post('/')
  // @Auth({ visitor: true })
  // @UploadMultipleFiles([
  //   {
  //     name: 'identifyImage',
  //     maxCount: 1,
  //     filePath: uploadPath('image', 'user/identify'),
  //     fileType: 'image',
  //   },
  //   {
  //     maxCount: 1,

  //     name: 'image',
  //     filePath: uploadPath('image', 'user'),
  //     fileType: 'image',
  //   },
  // ])
  // async createDeliveryMan(
  //   @Res() res: Response,
  //   @Body() body: CreateDeliverymanDto,
  //   @UploadedFiles() files: UploadedFile[],
  //   @CurrentUser('role') role: Role,
  //   @LocaleHeader() locale: Locale,
  // ) {
  //   await this.prisma.validateBody(body);
  //   const data = await this.service.register(body, files, role, locale);
  //   return this.response.success(res,locale, 'Deliveryman created successfully', data);
  // }

  @Patch(['/', '/:id'])
  @UploadMultipleFiles([
    {
      name: 'identifyImage',
      maxCount: 1,
      filePath: uploadPath('image', 'user/identify'),
      fileType: 'image',
    },
    {
      maxCount: 1,

      name: 'image',
      filePath: uploadPath('image', 'user'),
      fileType: 'image',
    },
  ])
  @Auth()
  @ApiOptionalIdParam()
  async updateDelivery(
    @Res() res: Response,
    @Body() dto: UpdateDeliverymanDTO,
    @Param() { id }: OptionalIdParam,
    @LocaleHeader() locale: Locale,
    @CurrentUser() currentUser: CurrentUser,
    @UploadedFiles() files?: UploadedFile[],
  ) {
    if (id) {
      await this.prisma.returnUnique('delivery', 'id', id);
    }
    const body = createWithId(dto, id || currentUser.id);
    await this.service.updateDelivery(body, files);
    return this.response.success(
      res,
      locale,
      'Deliveryman updated successfully',
    );
  }

  @Post('/verify/:id')
  @ApiRequiredIdParam()
  async verifyStore(
    @Res() res: Response,
    @Param() { id }: RequiredIdParam,
    @Body() body: PhoneVerifyDTO,
    @LocaleHeader() locale: Locale,
  ) {
    body.id = id;
    await this.service.verifyDelivery(body, locale);
    return this.response.success(res, locale, 'Verify Delivery Successfully');
  }

  @Get('/statistics')
  @Auth({ roles: [Roles.DELIVERY, Roles.ADMIN] })
  @ApiQuery({ type: PartialType(FilterDeliverymanDTO) })
  async statistics(
    @Res() res: Response,
    @Filter({ dto: FilterDeliverymanDTO }) filters: FilterDeliverymanDTO,
    @CurrentUser() currentUser: CurrentUser,
    @CurrentUser('role') role: Role,
    @LocaleHeader() locale: Locale,
  ) {
    if (role.baseRole === Roles.DELIVERY) filters.id = currentUser.id;
    const data = await this.service.getDeliveryStatistics(filters);
    return this.response.success(
      res,
      locale,
      'Data_returned_successfully',

      data,
    );
  }
  @Get('/dispatch')
  @Auth({ permissions: ['Dispatch'] })
  async dispatch(@Res() res: Response, @LocaleHeader() locale: Locale) {
    const data = await this.service.getDeliveryDispatch();
    return this.response.success(
      res,
      locale,
      'Data_returned_successfully',

      data,
    );
  }

  @Get('/wallet')
  @Auth({ roles: [Roles.DELIVERY] })
  async findWallet(
    @Res() res: Response,
    @CurrentUser() currentUser: CurrentUser,
    @LocaleHeader() locale: Locale,
  ) {
    const wallet = await this.service.findWallet(currentUser.id);
    return this.response.success(
      res,
      locale,
      'delivery_wallet_fetched_successfully',

      wallet,
    );
  }

  @Get('/financial')
  @Auth({ roles: [Roles.DELIVERY] })
  async getFinancial(
    @Res() res: Response,
    @CurrentUser() currentUser: CurrentUser,
    @LocaleHeader() locale: Locale,
  ) {
    const statistics = await this.service.getFinancial(currentUser.id);
    return this.response.success(
      res,
      locale,
      'Data_returned_successfully',

      statistics,
    );
  }

  @Get(['/', '/:id'])
  @Auth({ roles: [Roles.ADMIN] })
  async getAll(
    @Res() res: Response,
    @Query() query: FilterDeliverymanDTO,
    @LocaleHeader() locale: Locale,
  ) {
    if (query.id) await this.prisma.returnUnique('delivery', 'id', query.id);
    const { data, total } = await this.service.getAll(query);

    return this.response.success(
      res,
      locale,
      'Data_returned_successfully',

      data,
      {
        total,
      },
    );
  }
}
