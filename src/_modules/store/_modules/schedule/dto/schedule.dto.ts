import { ApiProperty } from '@nestjs/swagger';
import { Days, NotificationSetupStatus } from '@prisma/client';
import { Optional } from 'src/decorators/dto/optional-input.decorator';
import { Required } from 'src/decorators/dto/required-input.decorator';
import { ValidateNumber } from 'src/decorators/dto/validators/validate-number.decorator';
import { ValidateTime } from 'src/decorators/dto/validators/validate-time.decorator';
import { EnumArrayFilter } from 'src/decorators/filters/enum.filter.decorator';

export class CreateScheduleDTO {
  @Required({})
  @ValidateTime()
  openingTime: Date;

  @Required({})
  @ValidateTime()
  closingTime: Date;

  @ApiProperty()
  @EnumArrayFilter(Days, 'Day', 'Choose day')
  day: Days;
}
