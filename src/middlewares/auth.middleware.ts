import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

// declare global {
//   namespace Express {
//     interface Request {
//       token?: string;
//     }
//   }
// }

declare module 'Express' {
  interface Request {
    token?: string;
  }
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const [type, token] = req.headers.authorization?.split(' ') ?? [];
    if (type === 'Bearer' && token) {
      req.token = token;
    }
    next();
  }
}
