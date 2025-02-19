import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ResponseService } from 'src/globals/services/response.service';
import { UserDashboardService } from './user.dashboard.service';

@Controller('user/dashboard')
@ApiTags('User Dashboard', 'Dashboard')
export class UserDashboardController {
  constructor(
    private responses: ResponseService,
    private userDashboardService: UserDashboardService,
  ) {}

  // @Get(['/', '/:id'])
  // @ApiQuery({ type: PartialType(FilterUserDTO) })
  // @Auth({ permissions: [`users_get`] })
  // async getMoos(
  //   @Res() res: Response,
  //   @Filter({ dto: FilterUserDTO }) filters: FilterUserDTO,
  // ) {
  //   const { data, total } = await this.userDashboardService.getUsers(filters);

  //   return this.responses.success(res,locale, '', data, { total });
  // }
}
