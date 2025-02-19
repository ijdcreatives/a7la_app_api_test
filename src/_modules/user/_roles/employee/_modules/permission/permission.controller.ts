import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Auth } from 'src/_modules/authentication/decorators/auth.decorator';
import { CurrentUser } from 'src/_modules/authentication/decorators/current-user.decorator';
import { LocaleHeader } from 'src/_modules/authentication/decorators/locale.decorator';
import { ResponseService } from 'src/globals/services/response.service';
import { PermissionService } from './permission.service';

const prefix = 'Employee';

@Controller('Permission')
@ApiTags(prefix)
@Auth({ permissions: [prefix] })
export class PermissionController {
  constructor(
    private services: PermissionService,
    private responses: ResponseService,
  ) {}

  @Get(['/'])
  async findAll(
    @Res() res: Response,
    @LocaleHeader() locale: Locale,
    @CurrentUser('role') role: Role,
  ) {
    const { permissions, total } = await this.services.findAll(role, locale);

    const updatedPermissions = permissions.map(
      (permission: { name: string }) => ({
        name: permission.name,
        id: permission.name,
      }),
    );
    return this.responses.success(
      res,
      locale,
      'Permissions Fetched Successfully',

      updatedPermissions,
      { total },
    );
  }
}
