import { IsEmail, IsBoolean, IsString, IsOptional } from 'class-validator';
export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsBoolean()
  @IsOptional()
  admin: boolean;
}
