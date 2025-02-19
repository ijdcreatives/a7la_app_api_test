import { PartialType } from '@nestjs/swagger';
import { CreateUserDTO } from './user.dto';

export class UpdateUserDTO extends PartialType(CreateUserDTO) {}
