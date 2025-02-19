import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '@prisma/client';
import { Response } from 'express';
import { Auth } from 'src/_modules/authentication/decorators/auth.decorator';
import { PrismaService } from 'src/globals/services/prisma.service';
import { ResponseService } from 'src/globals/services/response.service';
import { CreateFundDTO } from './dto/fund.dto';
import { FundService } from './fund.service';
import { LocaleHeader } from 'src/_modules/authentication/decorators/locale.decorator';

const prefix = 'Fund';

@Controller(prefix.toLowerCase())
@ApiTags(prefix)
export class FundController {
  constructor(
    private readonly service: FundService,
    private readonly responseService: ResponseService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('/')
  @Auth({ roles: [Roles.ADMIN] })
  async create(
    @Res() res: Response,
    @Body() body: CreateFundDTO,
    @LocaleHeader() locale: Locale,
  ) {
    await this.prisma.validateBody(body);
    await this.service.create(body);
    return this.responseService.created(
      res,
      locale,
      'fund created successfully',
    );
  }
}
