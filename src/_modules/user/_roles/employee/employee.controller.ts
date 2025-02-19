import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags, PartialType } from '@nestjs/swagger';
import { PrismaClient } from '@prisma/client';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { Auth } from 'src/_modules/authentication/decorators/auth.decorator';
import { CurrentUser } from 'src/_modules/authentication/decorators/current-user.decorator';
import { LocaleHeader } from 'src/_modules/authentication/decorators/locale.decorator';
import { uploadPath } from 'src/_modules/media/configs/upload.config';
import { ApiRequiredIdParam } from 'src/decorators/api/id-params.decorator';
import { UploadFile } from 'src/decorators/api/upload-file.decorator';
import { Filter } from 'src/decorators/param/filter.decorator';
import { RequiredIdParam } from 'src/dtos/params/id-param.dto';
import { PrismaService } from 'src/globals/services/prisma.service';
import { ResponseService } from 'src/globals/services/response.service';
import {
  CreateEmployeeDTO,
  FilterEmployeeDTO,
  UpdateEmployeeDTO,
} from './dto/register.dto';
import { EmployeeService } from './employee.service';

const prefix = 'Employee';

@Controller(prefix.toLowerCase())
@ApiTags(prefix)
@Auth({ permissions: [prefix] })
export class EmployeeController {
  constructor(
    private services: EmployeeService,
    private responses: ResponseService,
    private prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  @Post('/')
  @UploadFile('image', uploadPath('image', 'user/employee'))
  @ApiOperation({ summary: 'Create Employee for [Store , Admin]' })
  async create(
    @Res() res: Response,
    @Body() body: CreateEmployeeDTO,
    @CurrentUser('role') role: Role,
    @CurrentUser('storeId') storeId: Id,
    @UploadedFile() file: UploadedFile,
    @LocaleHeader() locale: Locale,
  ) {
    await this.prisma.validateBody(body);
    await this.services.register(body, role, file, storeId);
    return this.responses.created(res, locale, 'Employee created successfully');
  }
  @Get(['/', '/:id'])
  @ApiOperation({ summary: 'Get Employee for [Store , Admin]' })
  @ApiQuery({ type: PartialType(FilterEmployeeDTO) })
  async findAll(
    @Res() res: Response,
    @LocaleHeader() locale: Locale,
    @Filter({ dto: FilterEmployeeDTO }) filters: FilterEmployeeDTO,
    @CurrentUser('role') role: Role,
    @CurrentUser('storeId') storeId: Id,
  ) {
    if (filters.id) {
      await this.prisma.returnUnique(
        role.baseRole.toString().toLowerCase() as keyof PrismaClient,
        'id',
        filters.id,
      );
    }
    const { data, total } = await this.services.findAll(
      locale,
      filters,
      role,
      storeId,
    );
    if (!filters.id) {
      return this.responses.success(
        res,
        locale,
        'Employee Fetched Successfully',

        data,
        {
          total,
        },
      );
    }
    return this.responses.success(
      res,
      locale,
      'Employee Fetched Successfully',

      data,
    );
  }

  @Patch(['/:id'])
  @UploadFile('image', uploadPath('image', 'user/employee'))
  @ApiRequiredIdParam()
  @ApiOperation({ summary: 'Update Employee [Store , Admin]' })
  async update(
    @Res() res: Response,
    @Param() { id }: RequiredIdParam,
    @Body() body: UpdateEmployeeDTO,
    @CurrentUser('role') role: Role,
    @CurrentUser('storeId') storeId: Id,
    @LocaleHeader() locale: Locale,
    @UploadedFile() file?: UploadedFile,
  ) {
    await this.prisma.validateBody(body);
    await this.prisma.returnUnique(
      role.baseRole.toString().toLowerCase() as keyof PrismaClient,
      'id',
      id,
    );

    const employee = await this.services.update(
      body,
      id,
      role,
      file,
      locale,
      storeId,
    );

    return this.responses.success(
      res,
      locale,
      'Employee Updated Successfully',

      employee,
    );
  }

  @Delete(['/:id'])
  @ApiRequiredIdParam()
  @ApiOperation({ summary: 'Delete Employee [Store , Admin]' })
  async delete(
    @Res() res: Response,
    @Param() { id }: RequiredIdParam,
    @CurrentUser('role') role: Role,
    @LocaleHeader() locale: Locale,
  ) {
    await this.prisma.returnUnique(
      role.baseRole.toString().toLowerCase() as keyof PrismaClient,
      'id',
      id,
    );
    await this.services.delete(id, role);

    return this.responses.success(res, locale, 'Employee Deleted Successfully');
  }
}
