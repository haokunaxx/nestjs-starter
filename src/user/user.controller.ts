import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthService } from './auth.service';
// import { SignInDto } from './dto/sign-in.dto';

@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  // @Post('createUser')
  // async createUser(@Body() body: CreateUserDto) {
  //   const { email } = body;
  //   const user = await this.service.find(email);
  //   if (user.length) {
  //     throw new BadRequestException('email 已注册');
  //   }
  //   // this.service.createUser(body);
  // }
  @Post('signUp')
  async signUp(@Body() body: CreateUserDto) {
    return this.authService.signUp(body);
  }

  // @Post('signIn')
  // signIn(@Body() body: SignInDto){

  // }
}
