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
import { ApiOperation, ApiQuery, ApiTags, PartialType } from '@nestjs/swagger';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { ApiRequiredIdParam } from 'src/decorators/api/id-params.decorator';
import { Filter } from '../../../../../../decorators/param/filter.decorator';
import { RequiredIdParam } from '../../../../../../dtos/params/id-param.dto';
import { PrismaService } from '../../../../../../globals/services/prisma.service';
import { ResponseService } from '../../../../../../globals/services/response.service';
import { Auth } from '../../../../../authentication/decorators/auth.decorator';
import { CurrentUser } from '../../../../../authentication/decorators/current-user.decorator';
import { LocaleHeader } from '../../../../../authentication/decorators/locale.decorator';
import { CreateRoleDTO, FindRoleDTO, UpdateRoleDTO } from './dto/role.dto';
import { RoleService } from './role.service';

const prefix = 'Employee';

@Controller('role')
@ApiTags('Employee')
@Auth({ permissions: [prefix] })
export class RoleController {
  constructor(
    private services: RoleService,
    private responses: ResponseService,
    private prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  @Post('/')
  @ApiOperation({ summary: 'Create Role For Employee [Store , Admin]' })
  async create(
    @Res() res: Response,
    @Body() body: CreateRoleDTO,
    @CurrentUser('role') role: Role,
    @CurrentUser('storeId') storeId: Id,
    @LocaleHeader() locale: Locale,
  ) {
    await this.prisma.validateBody(body);
    await this.services.validateUnique(body, storeId, role.baseRole, locale);
    await this.services.create(body, role.baseRole, storeId);
    return this.responses.created(res, locale, 'Role Created Successfully');
  }
  @Get(['/', '/:id'])
  @ApiQuery({ type: PartialType(FindRoleDTO) })
  @ApiOperation({ summary: 'Get All Roles [Store , Admin]' })
  async findAll(
    @Res() res: Response,
    @LocaleHeader() locale: Locale,
    @Filter({ dto: FindRoleDTO }) filters: FindRoleDTO,
    @CurrentUser('role') role: Role,
    @CurrentUser('storeId') storeId: Id,
  ) {
    const { data, total } = await this.services.findAll(
      locale,
      filters,
      role.baseRole,
      storeId,
    );
    return this.responses.success(
      res,
      locale,
      'Role Fetched Successfully',

      data,
      {
        total,
      },
    );
  }

  @Patch(['/:id'])
  @ApiRequiredIdParam()
  @ApiOperation({ summary: 'Update Role For Employee [Store , Admin]' })
  async update(
    @Res() res: Response,
    @Param() { id }: RequiredIdParam,
    @Body() body: UpdateRoleDTO,
    @CurrentUser('role') role: Role,
    @CurrentUser('storeId') storeId: Id,
    @LocaleHeader() locale: Locale,
  ) {
    await this.prisma.validateBody(body);
    await this.prisma.returnUnique('role', 'id', id);

    await this.services.validateUnique(body, storeId, role.baseRole, locale);

    const store = await this.services.update(body, id, role, locale, storeId);

    return this.responses.success(
      res,
      locale,
      'Role Updated Successfully',

      store,
    );
  }

  @Delete(['/:id'])
  @ApiRequiredIdParam()
  @ApiOperation({ summary: 'Delete Role For Employee [Store , Admin]' })
  async delete(
    @Res() res: Response,
    @Param() { id }: RequiredIdParam,
    @CurrentUser('role') role: Role,
    @CurrentUser('storeId') storeId: Id,
    @LocaleHeader() locale: Locale,
  ) {
    await this.prisma.returnUnique('role', 'id', id);
    const store = await this.services.delete(id, role, storeId, locale);

    return this.responses.success(
      res,
      locale,
      'Role Deleted Successfully',

      store,
    );
  }
}
