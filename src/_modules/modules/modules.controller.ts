import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFiles,
  Res,
} from '@nestjs/common';
import { ApiQuery, ApiTags, PartialType } from '@nestjs/swagger';
import { Response } from 'express';
import {
  ApiOptionalIdParam,
  ApiRequiredIdParam,
} from 'src/decorators/api/id-params.decorator';
import { UploadMultipleFiles } from 'src/decorators/api/upload-file.decorator';
import { Filter } from 'src/decorators/param/filter.decorator';
import { RequiredIdParam } from 'src/dtos/params/id-param.dto';
import { localizedDto } from 'src/globals/helpers/localizedDto.return';
import { PrismaService } from 'src/globals/services/prisma.service';
import { ResponseService } from 'src/globals/services/response.service';
import { Auth } from '../authentication/decorators/auth.decorator';
import { CurrentUser } from '../authentication/decorators/current-user.decorator';
import { LocaleHeader } from '../authentication/decorators/locale.decorator';
import { uploadPath } from '../media/configs/upload.config';
import { CreateModuleDto, FilterModuleDTO } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { ModulesService } from './modules.service';

const prefix = 'Modules';
@ApiTags(prefix)
@Controller(prefix.toLowerCase())
export class ModulesController {
  constructor(
    private readonly services: ModulesService,
    private readonly responseService: ResponseService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @Auth({ permissions: [prefix] })
  @UploadMultipleFiles([
    {
      name: 'thumbnail',
      maxCount: 1,
      filePath: uploadPath('image', 'modules'),
      fileType: 'image',
    },
    {
      maxCount: 1,

      name: 'icon',
      filePath: uploadPath('image', 'modules'),
      fileType: 'image',
    },
  ])
  async create(
    @Body() body: CreateModuleDto,
    @Res() res: Response,
    @LocaleHeader() locale: Locale,
    @UploadedFiles() files?: UploadedFile[],
  ) {
    localizedDto(body);
    await this.services.validateUnique(body);
    await this.services.create(files, body);
    return this.responseService.created(
      res,
      locale,
      'Module Created Successfully',
    );
  }

  @Patch('/:id')
  @Auth({ permissions: [prefix] })
  @UploadMultipleFiles([
    {
      name: 'thumbnail',
      maxCount: 1,
      filePath: uploadPath('image', 'modules'),
      fileType: 'image',
    },
    {
      maxCount: 1,
      name: 'icon',
      filePath: uploadPath('image', 'modules'),
      fileType: 'image',
    },
  ])
  @ApiRequiredIdParam()
  async update(
    @Body() body: UpdateModuleDto,
    @Res() res: Response,
    @LocaleHeader() locale: Locale,
    @Param() { id }: RequiredIdParam,
    @UploadedFiles() files?: UploadedFile[],
  ) {
    localizedDto(body);
    await this.prisma.returnUnique('module', 'id', id);
    await this.services.validateUnique(body, id);
    await this.services.update(id, files, body);
    return this.responseService.created(
      res,
      locale,
      'Module Updated Successfully',
    );
  }

  @Get(['/', '/:id'])
  @Auth({ visitor: true })
  @ApiQuery({ type: PartialType(FilterModuleDTO) })
  @ApiOptionalIdParam()
  async findAll(
    @Res() res: Response,
    @LocaleHeader() locale: Locale,
    @CurrentUser('role') role: Role,
    @Filter({ dto: FilterModuleDTO }) filters: FilterModuleDTO,
  ) {
    const { data, total } = await this.services.findAll(locale, role, filters);
    return this.responseService.success(
      res,
      locale,
      'Modules Fetched Successfully',

      data,
      { total },
    );
  }

  @Delete('/:id')
  @ApiRequiredIdParam()
  // @Auth({ permissions: [prefix] })
  async delete(
    @Res() res: Response,
    @Param() { id }: RequiredIdParam,
    @LocaleHeader() locale: Locale,
  ) {
    await this.prisma.returnUnique('module', 'id', id);
    await this.services.delete(id);
    return this.responseService.success(
      res,
      locale,
      'Module Deleted Successfully',
    );
  }
}
