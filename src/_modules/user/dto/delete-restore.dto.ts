import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class DeleteOrRestoreUserDTO {
  @ApiProperty({ type: [Number], required: true, example: [1, 2, 3] })
  @IsNumber({}, { each: true })
  ids: number[];

  @ApiProperty({ type: String, required: true, example: 'Impolite' })
  @IsOptional()
  @IsString()
  reason: string;
}
