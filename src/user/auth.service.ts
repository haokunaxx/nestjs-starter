import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { SignInDto } from './dto/sign-in.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
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

  async signIn(data: SignInDto) {
    const { email, password } = data;
    const [user] = await this.userService.find(email);
    if (!user) {
      throw new BadRequestException(`email ${email} 未注册`);
    }
    const [hashedPassword, salt] = user.password.split('.');

    const passwordAfterScrypt = (
      (await scrypt(password, salt, 32)) as Buffer
    ).toString('hex');

    if (hashedPassword !== passwordAfterScrypt) {
      throw new BadRequestException('密码不正确');
    }
    console.log('login', this.configService.get<string>('SECRET'));
    const token = await this.jwtService.signAsync(
      {
        id: user.id,
        email: user.email,
        admin: user.admin,
      },
      {
        secret: this.configService.get<string>('SECRET'),
      },
    );
    return {
      token,
    };
  }
}
