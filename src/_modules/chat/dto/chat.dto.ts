import { ApiProperty } from '@nestjs/swagger';
import { Roles } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { Optional } from 'src/decorators/dto/optional-input.decorator';
import { Required } from 'src/decorators/dto/required-input.decorator';
import { ValidateNumber } from 'src/decorators/dto/validators/validate-number.decorator';
import { EnumArrayFilter } from 'src/decorators/filters/enum.filter.decorator';
import { PaginationParamsDTO } from 'src/dtos/params/pagination-params.dto';

export class CreateMessageDto {
  @Required({})
  @Transform(({ value }) => +value)
  conversationId: Id;

  @Optional()
  @IsString()
  content?: string;

  @ApiProperty({ type: String, format: 'binary', required: false })
  file?: string[];
}

export class JoinConversationDto {
  @Required({})
  @Transform(({ value }) => +value)
  conversationId: Id;
}

export class FilterConversationDto extends PaginationParamsDTO {
  @ApiProperty()
  @IsOptional()
  @Transform(({ value }) => +value)
  id?: Id;

  @Optional()
  @ValidateNumber()
  orderId?: Id;

  @Optional()
  @IsString()
  name?: string;
}

export class FilterMessageDto extends PaginationParamsDTO {
  @ApiProperty()
  @IsOptional()
  @Transform(({ value }) => +value)
  id?: Id;
}
export class CreateConversationDto {
  @Required({})
  @Transform(({ value }) => +value)
  receiverId: Id;

  @Required({})
  @EnumArrayFilter(Roles, 'role', 'Role')
  receiverRole: Roles;
}
