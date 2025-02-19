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
import { ApiQuery, ApiTags, PartialType } from '@nestjs/swagger';
import { Response } from 'express';
import { Auth } from 'src/_modules/authentication/decorators/auth.decorator';
import { CurrentUser } from 'src/_modules/authentication/decorators/current-user.decorator';
import { LocaleHeader } from 'src/_modules/authentication/decorators/locale.decorator';
import { ApiRequiredIdParam } from 'src/decorators/api/id-params.decorator';
import { Filter } from 'src/decorators/param/filter.decorator';
import { RequiredIdParam } from 'src/dtos/params/id-param.dto';
import { PrismaService } from 'src/globals/services/prisma.service';
import { ResponseService } from 'src/globals/services/response.service';
import { StoreHelperService } from '../../services/helper.service';
import { StoreService } from '../../services/store.service';
import { BranchService } from './branch.service';
import {
  CreateBranchDTO,
  FilterBranchDTO,
  UpdateBranchDTO,
} from './dto/branch.dto';

const prefix = 'Branches';
@ApiTags('Store')
@Controller('branch')
export class BranchController {
  constructor(
    private readonly service: BranchService,
    private readonly prisma: PrismaService,
    private readonly response: ResponseService,
    private readonly storeService: StoreService,
  ) {}

  @Post('/')
  @Auth({ permissions: [prefix] })
  async createBranch(
    @Res() res: Response,
    @Body() body: CreateBranchDTO,
    @LocaleHeader() locale: Locale,
    @CurrentUser('storeId') storeId: Id,
  ) {
    const { vendor, ...data } = body;
    const user = StoreHelperService.createUserObject(vendor);
    const zone = body.point
      ? StoreHelperService.createZoneObject(body.branchName, body.point)
      : undefined;
    const mainStore = await this.prisma.returnUnique('store', 'id', storeId);
    await this.prisma.validateBody(data);
    await this.prisma.$transaction(
      async (tx) => {
        await this.service.createBranch(
          tx,
          user,
          zone,
          body,
          mainStore.mainStoreId,
          false,
          locale,
        );
      },
      {
        timeout: 10000, // Set timeout to 10 seconds (default is 5000ms)
      },
    );

    return this.response.created(res, locale, 'Branch Created Successfully');
  }

  @Patch('/:id')
  @ApiRequiredIdParam()
  @Auth({ permissions: [prefix] })
  async updateBranch(
    @Res() res: Response,
    @Param() { id }: RequiredIdParam,
    @Body() body: UpdateBranchDTO,
    @LocaleHeader() locale: Locale,
  ) {
    const { vendor, ...data } = body;
    const user = body.vendor
      ? StoreHelperService.createUserObject(vendor)
      : undefined;
    const zone = body.point
      ? StoreHelperService.createZoneObject(body.branchName, body.point)
      : undefined;
    await this.prisma.validateBody(data);
    await this.prisma.$transaction(
      async (tx) => {
        await this.service.updateBranch(tx, user, zone, body, id, locale);
      },
      { timeout: 1000000 },
    );
    return this.response.created(res, locale, 'Branch Updated Successfully');
  }

  @Get('/')
  @Auth({ permissions: [prefix] })
  @ApiQuery({ type: PartialType(FilterBranchDTO) })
  async findAll(
    @Res() res: Response,
    @LocaleHeader() locale: Locale,
    @Filter({ dto: FilterBranchDTO }) filters: FilterBranchDTO,
    @CurrentUser('mainStoreId') mainStoreId: Id,
  ) {
    const { stores, total } = await this.service.findAll(
      mainStoreId,
      filters,
      locale,
    );
    return this.response.success(
      res,
      locale,
      'stores_fetched_successfully',
      stores,
      {
        total,
      },
    );
  }

  @Get('/statistics')
  @Auth({ permissions: [prefix] })
  async findStatistics(
    @Res() res: Response,
    @LocaleHeader() locale: Locale,
    @CurrentUser('mainStoreId') mainStoreId: Id,
  ) {
    const statistics = await this.service.findStatistics(mainStoreId);
    return this.response.success(
      res,
      locale,
      'statistics_fetched_successfully',

      statistics,
    );
  }

  @Delete('/:id')
  @Auth({ permissions: [prefix] })
  @ApiRequiredIdParam()
  async deleteBranch(
    @Res() res: Response,
    @Param() { id }: RequiredIdParam,
    @LocaleHeader() locale: Locale,
  ) {
    await this.service.deleteBranch(id);
    return this.response.success(res, locale, 'Branch Deleted Successfully');
  }
}
