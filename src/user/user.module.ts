import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import User from './user.entity';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([User]), JwtModule],
  controllers: [UserController],
  providers: [UserService, AuthService],
})
export class UserModule {}
