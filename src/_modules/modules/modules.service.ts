import { ConflictException, Injectable } from '@nestjs/common';
import { firstOrMany } from 'src/globals/helpers/first-or-many';
import { localizedObject } from 'src/globals/helpers/localized.return';
import { PrismaService } from 'src/globals/services/prisma.service';
import { handelSucceededTemp } from '../media/helpers/handel-temp-files';
import { HandelFiles } from '../media/helpers/handel-types';
import { CreateModuleDto, FilterModuleDTO } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import {
  getArgsWithSelect,
  getWhereArgs,
} from './prisma-args/module.prisma.args';

@Injectable()
export class ModulesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(files: UploadedFile[], body: CreateModuleDto): Promise<void> {
    this.generatePaths(files, body);
    const { ...data } = body;
    await this.validateUnique(body);
    await this.prisma.module.create({ data });
    handelSucceededTemp(files, body.nameEn);
  }

  async update(
    id: Id,
    files: UploadedFile[],
    body: UpdateModuleDto,
  ): Promise<void> {
    if (files) this.generatePaths(files, body);
    const { ...data } = body;
    await this.validateUnique(body, id);
    await this.prisma.module.update({ where: { id }, data });
    handelSucceededTemp(files, 'Edit');
  }

  async delete(id: Id) {
    try {
      await this.prisma.module.delete({ where: { id } });
    } catch (_) {}
  }
  //
  async findAll(
    locale: Locale,
    role: Role,
    filters: FilterModuleDTO,
  ): Promise<{ data: Module[]; total: number }> {
    const GetWhereArgs = getWhereArgs(filters, role.baseRole);
    const GetSelectArgs = getArgsWithSelect(role.baseRole);
    const modules = await this.prisma.module[firstOrMany(filters?.id)]({
      ...GetWhereArgs,
      ...GetSelectArgs,
    });
    const total = await this.prisma.module.count({
      ...GetWhereArgs,
    });

    return {
      data: localizedObject(modules, locale, [
        'nameAr',
        'nameEn',
        'descriptionAr',
        'descriptionEn',
        'replacementAndRetrievalPolicyAr',
        'replacementAndRetrievalPolicyEn',
      ]) as Module[],
      total,
    };
  }
  //  test
  // test
  async validateUnique(
    body: CreateModuleDto | UpdateModuleDto,
    id?: Id,
  ): Promise<void> {
    const exist = await this.prisma.module.findFirst({
      where: {
        AND: [
          { OR: [{ nameAr: body.nameAr }, { nameEn: body.nameEn }] },
          { deletedAt: null },
        ],
      },
    });

    if (exist && (!id || exist.id !== id))
      throw new ConflictException('Module Name Already Exist');
  }

  generatePaths(files: UploadedFiles, body: CreateModuleDto | UpdateModuleDto) {
    const pathData: Partial<{ icon: UploadedFile; thumbnail: UploadedFile }> =
      {};
    if (files['icon']?.[0]) pathData.icon = files['icon'][0];
    if (files['thumbnail']?.[0]) pathData.thumbnail = files['thumbnail'][0];
    HandelFiles.generatePath<
      Partial<{ icon: UploadedFile; thumbnail: UploadedFile }>,
      CreateModuleDto | UpdateModuleDto
    >(pathData, body, body.nameEn ?? 'Edit');
  }
}
