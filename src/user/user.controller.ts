import { Controller, Post, Get, Body, Headers } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { JwtService } from '@nestjs/jwt';
import { Public } from 'src/decorators/auth.decorator';

@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Public()
  @Post('signUp')
  async signUp(@Body() body: CreateUserDto) {
    return this.authService.signUp(body);
  }

  @Public()
  @Post('signIn')
  signIn(@Body() body: SignInDto) {
    return this.authService.signIn(body);
  }

  @Get('getUserInfo')
  getUserInfo(@Headers('authorization') token?: string) {
    console.log(' -- ', token);
    // const info = this.jwtService.verify(token);
    // console.log(info);
  }
}
