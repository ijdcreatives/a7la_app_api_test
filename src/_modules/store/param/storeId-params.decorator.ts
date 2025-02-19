import { ValidateNumber } from 'src/decorators/dto/validators/validate-number.decorator';

export class RequiredModuleIdParam {
  @ValidateNumber()
  moduleId: Id;
}
