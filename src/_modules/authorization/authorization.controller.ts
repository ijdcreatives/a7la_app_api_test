import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '@prisma/client';
import { Response } from 'express';
import { ResponseService } from 'src/globals/services/response.service';
import { Auth } from '../authentication/decorators/auth.decorator';
import { CurrentUser } from '../authentication/decorators/current-user.decorator';
import { LocaleHeader } from '../authentication/decorators/locale.decorator';
import { AuthorizationService } from './authorization.service';

@Controller('authorization')
@ApiTags('Authorization')
export class AuthorizationController {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly responses: ResponseService,
  ) {}

  @Get('permissions')
  @Auth({ roles: [Roles.ADMIN, Roles.VENDOR] })
  async getPermissions(
    @Res() res: Response,
    @CurrentUser('role') role: Role,
    @CurrentUser('storeId') storeId: Id,
    @LocaleHeader() locale: Locale,
  ) {
    const permissions = await this.authorizationService.getPermissions(
      role,
      locale,
      storeId,
    );

    return this.responses.success(
      res,
      locale,
      'Get Permissions Successfully',

      permissions,
    );
  }
}
