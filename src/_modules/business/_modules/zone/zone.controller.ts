import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import { ApiQuery, ApiTags, PartialType } from '@nestjs/swagger';
import { Roles } from '@prisma/client';
import { Response } from 'express';
import { Auth } from 'src/_modules/authentication/decorators/auth.decorator';
import { CurrentUser } from 'src/_modules/authentication/decorators/current-user.decorator';
import { LocaleHeader } from 'src/_modules/authentication/decorators/locale.decorator';
import { ApiRequiredIdParam } from 'src/decorators/api/id-params.decorator';
import { Filter } from 'src/decorators/param/filter.decorator';
import { RequiredIdParam } from 'src/dtos/params/id-param.dto';
import { PrismaService } from 'src/globals/services/prisma.service';
import { ResponseService } from 'src/globals/services/response.service';
import { CreateZoneDTO, FilterZoneDTO, UpdateZoneDTO } from './dto/zone.dto';
import { ZoneService } from './zone.service';

const prefix = 'Zone';

@Controller(prefix.toLowerCase())
@ApiTags(prefix)
export class ZoneController {
  constructor(
    private readonly service: ZoneService,
    private readonly responseService: ResponseService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('/')
  @Auth({ roles: [Roles.ADMIN] })
  async create(
    @Res() res: Response,
    @Body() body: CreateZoneDTO,
    @LocaleHeader() locale: Locale,
  ) {
    await this.prisma.validateBody(body);
    const isFound = await this.service.validateUnique(body);
    if (isFound) throw new ConflictException('name_already_exist');
    await this.prisma.$transaction(async (tx) => {
      await this.service.create(tx, { ...body, isActive: true });
    });
    return this.responseService.created(
      res,
      locale,
      'zone_created_successfully',
    );
  }

  @Get(['/', '/:id'])
  @ApiQuery({ type: PartialType(FilterZoneDTO) })
  @Auth({ visitor: true })
  async findAll(
    @Res() res: Response,
    @LocaleHeader() locale: Locale,
    @Filter({ dto: FilterZoneDTO }) filters: FilterZoneDTO,
    @CurrentUser('role') role: Role,
  ) {
    const zones = await this.service.findAll(locale, filters, role);
    const total = await this.service.zoneCount(filters, locale, role);
    return this.responseService.success(
      res,
      locale,
      'zones_fetched_successfully',

      zones,
      {
        total,
      },
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
    @Body() body: UpdateZoneDTO,
    @LocaleHeader() locale: Locale,
  ) {
    await this.prisma.validateBody(body);
    await this.prisma.returnUnique('zone', 'id', id);
    const isFound = await this.service.validateUnique(body);
    if (isFound) throw new ConflictException('name_already_exist');

    await this.service.update(id, body);

    return this.responseService.success(
      res,
      locale,
      'update_zone_successfully',
    );
  }

  @Delete('/:id')
  @Auth({
    roles: [Roles.ADMIN],
  })
  @ApiRequiredIdParam()
  async deleteZone(
    @Res() res: Response,
    @Param() { id }: RequiredIdParam,
    @LocaleHeader() locale: Locale,
  ) {
    await this.prisma.returnUnique('zone', 'id', id);

    await this.service.delete(id);

    return this.responseService.success(
      res,
      locale,
      'delete_zone_successfully',
    );
  }
}
