import { IsEmail, IsBoolean, IsString, IsOptional } from 'class-validator';
export class CreateUserDto {
  @IsEmail()
  username: string;

  @IsString()
  password: string;

  @IsBoolean()
  @IsOptional()
  admin: boolean;
}
