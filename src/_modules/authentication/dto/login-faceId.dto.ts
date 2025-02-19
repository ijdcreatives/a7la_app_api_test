import { Roles } from '@prisma/client';
import { Required } from 'src/decorators/dto/required-input.decorator';
import { EnumArrayFilter } from 'src/decorators/filters/enum.filter.decorator';

export class LoginWithFaceId {
  @Required()
  deviceId: string;

  @Required({})
  @EnumArrayFilter(Roles, 'role', 'Role')
  role: Roles;
}
