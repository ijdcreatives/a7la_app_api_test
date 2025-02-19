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
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '@prisma/client';
import { Response } from 'express';
import { CurrentUser } from 'src/_modules/authentication/decorators/current-user.decorator';
import {
  ApiOptionalIdParam,
  ApiRequiredIdParam,
} from 'src/decorators/api/id-params.decorator';
import { UploadFile } from 'src/decorators/api/upload-file.decorator';
import { OptionalIdParam, RequiredIdParam } from 'src/dtos/params/id-param.dto';
import { PrismaService } from 'src/globals/services/prisma.service';
import { ResponseService } from 'src/globals/services/response.service';
import { Auth } from '../authentication/decorators/auth.decorator';
import { LocaleHeader } from '../authentication/decorators/locale.decorator';
import { uploadPath } from '../media/configs/upload.config';
import {
  AddAddressDTO,
  AddCarDeliveryDTO,
  UpdateAddressDTO,
  updateCarDeliveryDto,
} from './dto/address.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { UserService } from './user.service';

const prefix = 'user';
@Controller(prefix)
@ApiTags('Users')
export class UserController {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private responses: ResponseService,
  ) {}

  @Get('/profile')
  @Auth()
  async getProfile(
    @Res() res: Response,
    @CurrentUser() currentUser: CurrentUser,
    @CurrentUser('role') role: Role,
    @LocaleHeader() locale: Locale,
  ) {
    const user = await this.userService.getProfile(
      currentUser.id,
      role.baseRole,
      locale,
    );
    return this.responses.success(
      res,
      locale,
      'User returned successfully',

      user,
    );
  }

  @Post('/address')
  @Auth()
  async addAddress(
    @Res() res: Response,
    @Body() body: AddAddressDTO,
    @CurrentUser() currentUser: CurrentUser,
    @LocaleHeader() locale: Locale,
  ) {
    await this.userService.validateUniqueAddress(body, currentUser, false);

    const address = await this.userService.addAddress(body, currentUser);
    const { lat, lng, ...rest } = address;
    const data = {
      ...rest,
      lat: lat.toString(),
      lng: lng.toString(),
    };
    return this.responses.created(
      res,
      locale,
      'Address Created successfully',

      data,
    );
  }

  @Get(['/address', '/address/:id'])
  @Auth()
  @ApiOptionalIdParam()
  async getAddress(
    @Res() res: Response,
    @Param() { id }: OptionalIdParam,
    @CurrentUser() currentUser: CurrentUser,
    @LocaleHeader() locale: Locale,
  ) {
    const address = await this.userService.getAddress(currentUser, id);
    return this.responses.success(
      res,
      locale,
      'Address returned successfully',

      address,
    );
  }

  @Get('/statistics')
  @Auth({ roles: [Roles.ADMIN] })
  async getStatistics(@Res() res: Response, @LocaleHeader() locale: Locale) {
    const statistics = await this.userService.getStatistics();
    return this.responses.success(
      res,
      locale,
      'Statistics returned successfully',

      statistics,
    );
  }

  @Patch('/address')
  @Auth()
  async updateAddress(
    @Res() res: Response,
    @Body() data: UpdateAddressDTO,
    @CurrentUser() currentUser: CurrentUser,
    @LocaleHeader() locale: Locale,
  ) {
    await this.userService.validateUniqueAddress(data, currentUser, true);
    await this.userService.updateDefaultAddress(data, currentUser);
    return this.responses.success(res, locale, 'Address updated successfully');
  }

  @Patch('/car-delivery')
  @Auth()
  async updateCarDelivery(
    @Res() res: Response,
    @Body() data: updateCarDeliveryDto,
    @CurrentUser() currentUser: CurrentUser,
    @LocaleHeader() locale: Locale,
  ) {
    if (data.plate) await this.userService.validateUniqueCar(data, currentUser);
    await this.prisma.returnUnique('car', 'id', data.carId);
    await this.userService.UpdateCar(data);
    return this.responses.success(res, locale, 'Car updated successfully');
  }

  @Delete('/address/:id')
  @ApiRequiredIdParam()
  @Auth()
  async DeleteAddress(
    @Res() res: Response,
    @Param() { id }: RequiredIdParam,
    @LocaleHeader() locale: Locale,
  ) {
    await this.prisma.returnUnique('address', 'id', id);
    await this.userService.DeleteAddress(id);
    return this.responses.success(res, locale, 'Address Delete successfully');
  }

  @Delete('/car-delivery/:id')
  @ApiRequiredIdParam()
  @Auth()
  async DeleteCar(
    @Res() res: Response,
    @Param() { id }: RequiredIdParam,
    @LocaleHeader() locale: Locale,
  ) {
    await this.prisma.returnUnique('car', 'id', id);
    await this.userService.DeleteCar(id);
    return this.responses.success(res, locale, 'Car Delete successfully');
  }

  @Post('/car-delivery')
  @Auth()
  async addCarDelivery(
    @Res() res: Response,
    @Body() data: AddCarDeliveryDTO,
    @CurrentUser() currentUser: CurrentUser,
    @LocaleHeader() locale: Locale,
  ) {
    await this.userService.validateUniqueCar(data, currentUser);
    const address = await this.userService.addCarDelivery(data, currentUser);
    return this.responses.created(
      res,
      locale,
      'Car Created successfully',

      address,
    );
  }
  @Get('/car-delivery')
  @Auth()
  async getCarDelivery(
    @Res() res: Response,
    @CurrentUser() currentUser: CurrentUser,
    @LocaleHeader() locale: Locale,
  ) {
    const carDelivery = await this.userService.getCarDelivery(currentUser);
    return this.responses.success(
      res,
      locale,
      'Car delivery returned successfully',
      carDelivery,
    );
  }

  @Patch('/profile')
  @Auth()
  @UploadFile('image', uploadPath('image', 'user'))
  async updateProfile(
    @Res() res: Response,
    @CurrentUser('id') userId: Id,
    @Body() body: UpdateUserDTO,
    @LocaleHeader() locale: Locale,
    @CurrentUser('role') role: Role,
    @UploadedFile() file?: UploadedFile,
  ) {
    const user = await this.userService.updateUser(
      userId,
      body,
      locale,
      role.baseRole,
      file,
    );
    return this.responses.success(
      res,
      locale,
      'User updated successfully',
      user,
    );
  }

  // @Patch('/toggle-notifications')
  // @Auth()
  // async toggleNotifications(
  //   @Res() res: Response,
  //   @CurrentUser('id') userId: Id,
  // ) {
  //   const user = await this.userService.toggleNotification(userId);
  //   return this.responses.success(
  //     res,locale,
  //     `Notifications ${user.acceptNotification ? 'enabled' : 'disabled'}`,
  //   );
  // }

  @Delete('/')
  @Auth()
  async deleteAccount(
    @Res() res: Response,
    @CurrentUser('id') userId: Id,
    @LocaleHeader() locale: Locale,
  ) {
    await this.userService.deleteAccount(userId);
    return this.responses.success(res, locale, 'Account deleted successfully');
  }
}
