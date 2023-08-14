import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from 'src/decorators/auth.decorator';

@Injectable()
export class AuthGuards implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    console.log('is', isPublic);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    console.log('--- ', request, request.token);
    if (!request.token) {
      throw new UnauthorizedException();
    }
    try {
      console.log(this.configService.get<string>('SECRET'));
      const user = await this.jwtService.verifyAsync(request.token, {
        secret: this.configService.get<string>('SECRET'),
      });
      console.log(user);
      request.user = user;
    } catch (err) {
      console.log(err);
      throw new UnauthorizedException();
    }

    return true;
  }
}
