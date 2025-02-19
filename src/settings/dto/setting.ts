import { SettingDomain } from '@prisma/client';
import { ValidateEnum } from 'src/decorators/dto/enum.decorator';
import { Optional } from 'src/decorators/dto/optional-input.decorator';
import { Required } from 'src/decorators/dto/required-input.decorator';
import { ValidateObject } from 'src/decorators/dto/validators/validate-nested.decorator';
import { ValidateString } from 'src/decorators/dto/validators/validate-string.decorator';
import { ValidateSetting } from '../decorator/validate-setting.decorator';
import { SettingKey, SettingKeys } from '../settings';

class SettingDTO {
  @Required()
  @ValidateEnum(SettingKeys, true)
  setting: string;

  @Optional()
  @ValidateSetting()
  value: string;

  @Optional()
  @ValidateString()
  nameEn: string;

  @Optional()
  @ValidateString()
  nameAr: string;

  @Optional()
  @ValidateString()
  tooltipEn: string;

  @Optional()
  @ValidateString()
  tooltipAr: string;
}
export class UpdateSettingDTO {
  @Required({ type: [SettingDTO] })
  @ValidateObject(SettingDTO, true)
  settings: SettingDTO[];
}

export class KeyParam {
  @Optional()
  @ValidateEnum(SettingKeys, true)
  key: SettingKey;
}

export class SettingFilter {
  @Optional()
  @ValidateEnum(SettingKeys, true)
  key: SettingKey;

  @Optional()
  @ValidateEnum(SettingDomain)
  domain: SettingDomain;
}
