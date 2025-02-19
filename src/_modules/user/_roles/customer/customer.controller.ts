import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags, PartialType } from '@nestjs/swagger';
import { Roles } from '@prisma/client';
import { Response } from 'express';
import { Auth } from 'src/_modules/authentication/decorators/auth.decorator';
import { CurrentUser } from 'src/_modules/authentication/decorators/current-user.decorator';
import { LocaleHeader } from 'src/_modules/authentication/decorators/locale.decorator';
import { Filter } from 'src/decorators/param/filter.decorator';
import { PrismaService } from 'src/globals/services/prisma.service';
import { ResponseService } from 'src/globals/services/response.service';
import { CustomerService } from './customer.service';
import {
  CustomerLoginDTO,
  CustomerRegisterDTO,
  EnableFaceIdDTO,
  FilterCustomerDTO,
} from './dto/customer.dto';
import { I18nService } from 'nestjs-i18n';
import { GuestOTPService } from 'src/_modules/authentication/_modules/otp/guest-otp.service';

@Controller('customer')
@ApiTags('Customer')
export class CustomerController {
  constructor(
    private readonly prisma: PrismaService,
    private service: CustomerService,
    private responses: ResponseService,
    private readonly i18n: I18nService,
    private readonly otpService: GuestOTPService,
  ) {}

  @Post('/register')
  @Auth({ visitor: true })
  async register(
    @Res() res: Response,
    @Body() dto: CustomerRegisterDTO,
    @LocaleHeader() locale: Locale,
  ) {
    const user = await this.service.register(dto);

    await this.otpService.generateNewNumberOTP(user.phone, Roles.CUSTOMER);

    return this.responses.success(
      res,
      locale,
      'Customer Registered Successfully',

      user,
    );
  }

  @Post('/login')
  async login(
    @Res() res: Response,
    @Body() dto: CustomerLoginDTO,
    @LocaleHeader() locale: Locale,
  ) {
    const user = await this.service.login(dto, locale);
    return this.responses.success(
      res,
      locale,
      'Customer Logged In Successfully',

      user,
    );
  }

  @Get('/statistics')
  @Auth({ roles: [Roles.ADMIN] })
  async getStatistics(@Res() res: Response, @LocaleHeader() locale: Locale) {
    const statistics = await this.service.getStatistics();
    return this.responses.success(
      res,
      locale,
      'Statistics returned successfully',

      statistics,
    );
  }

  @Get(['/', '/:id'])
  @Auth({ roles: [Roles.ADMIN] })
  @ApiQuery({ type: PartialType(FilterCustomerDTO) })
  async findAll(
    @Res() res: Response,
    @LocaleHeader() locale: Locale,
    @CurrentUser('role') role: Role,
    @Filter({ dto: FilterCustomerDTO }) filters: FilterCustomerDTO,
  ) {
    if (filters.id) {
      await this.prisma.returnUnique('customer', 'id', filters.id);
    }
    const { data, total } = await this.service.findAll(
      locale,
      filters,
      role.baseRole,
    );
    return this.responses.success(
      res,
      locale,
      'customers_fetched_successfully',

      data,
      {
        total,
      },
    );
  }
}
