import { IsEmail, IsNotEmpty, IsString, Validate } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsStrongPasswordConstraint } from '../../common/validators';

export class ResetPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email!: string;

  @IsString()
  @IsNotEmpty()
  token!: string;

  @IsString()
  @IsNotEmpty()
  @Validate(IsStrongPasswordConstraint)
  newPassword!: string;
}

