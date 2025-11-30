import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { jwtPayload } from '../../auth/jwt-payload.interface';

export const CurrentUser = createParamDecorator(
  (data: keyof jwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user: jwtPayload }>();
    const user = request.user;

    if (!user) {
      throw new BadRequestException('User not found in request');
    }

    if (data) {
      const value = user[data];
      if (value === undefined) {
        throw new BadRequestException(
          `Field "${data}" not found in JWT payload`,
        );
      }
      return value;
    }

    return user;
  },
);
