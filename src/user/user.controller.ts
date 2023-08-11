import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('user')
export class UserController {
  constructor(private service: UserService) {}

  @Post('createUser')
  createUser(@Body() body: CreateUserDto) {
    console.log(body);
    this.service.createUser(body);
  }
}
