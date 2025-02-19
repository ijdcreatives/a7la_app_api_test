import { IsStrongPassword } from 'class-validator';

export class ResetPasswordDTO {
  @IsStrongPassword()
  password: string;
}
