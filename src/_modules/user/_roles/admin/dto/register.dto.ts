import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { CreateUserDTO } from 'src/_modules/user/dto/user.dto';

export class AdminRegisterDTO extends CreateUserDTO {
  @ApiProperty({ required: true })
  @IsString()
  role: string;
}
