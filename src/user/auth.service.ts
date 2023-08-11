import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { SignInDto } from './dto/sign-in.dto';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}
  async signUp(data: CreateUserDto) {
    const { email, password } = data;
    const user = await this.userService.find(email);
    if (user.length) {
      throw new BadRequestException(`email ${email} 已被注册`);
    }
    const salt = randomBytes(8).toString('hex');
    const passwordAfterScrypt = (
      (await scrypt(password, salt, 32)) as Buffer
    ).toString('hex');

    const result = `${passwordAfterScrypt}.${salt}`;
    this.userService.create({
      ...data,
      password: result,
    });
  }
}
