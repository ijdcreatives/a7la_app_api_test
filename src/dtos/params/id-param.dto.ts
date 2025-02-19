import { Transform } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';
import { ValidateNumber } from 'src/decorators/dto/validators/validate-number.decorator';

export class RequiredIdParam {
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  id: Id;
}

export class OptionalIdParam {
  @IsOptional()
  @ValidateNumber()
  id?: Id;
}
