import { NotificationSetupStatus } from '@prisma/client';
import { Optional } from 'src/decorators/dto/optional-input.decorator';
import { Required } from 'src/decorators/dto/required-input.decorator';
import { ValidateNumber } from 'src/decorators/dto/validators/validate-number.decorator';
import { EnumArrayFilter } from 'src/decorators/filters/enum.filter.decorator';

export class UpdateNotificationSetup {
  @Required({})
  @ValidateNumber()
  notificationId: Id;

  @Optional({})
  @EnumArrayFilter(
    NotificationSetupStatus,
    'NotificationSetupStatus',
    'Choose day',
  )
  pushEnabled: NotificationSetupStatus;

  @Optional()
  @EnumArrayFilter(
    NotificationSetupStatus,
    'NotificationSetupStatus',
    'Choose day',
  )
  emailEnabled: NotificationSetupStatus;

  @Optional()
  @EnumArrayFilter(
    NotificationSetupStatus,
    'NotificationSetupStatus',
    'Choose day',
  )
  smsEnabled: NotificationSetupStatus;
}

export class FilterNotificationSetupDTO {
  @Optional()
  @ValidateNumber()
  id?: Id;
}
