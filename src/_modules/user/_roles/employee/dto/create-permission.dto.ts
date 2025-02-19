import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreatePermissionDTO {
  @ApiProperty({ required: true })
  @IsString()
  name: string;
}
