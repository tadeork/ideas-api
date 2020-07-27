/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if (!request.headers.authorization) {
      return false;
    }
    request.user = await this.validateToken(request.headers.authorization);
    return true;
  }

  async validateToken(auth: string) {
    const tokenData = auth.split(' ');
    if (tokenData[0] !== 'Bearer') {
      throw new HttpException('Invalid token', HttpStatus.FORBIDDEN);
    }

    try {
      const decodedToken: any = await jwt.verify(
        tokenData[1],
        process.env.SECRET,
      );
      return decodedToken;
    } catch (err) {
      const message = 'Token error: ' + (err.message || err.name);
      throw new HttpException(message, HttpStatus.FORBIDDEN);
    }
  }
}
