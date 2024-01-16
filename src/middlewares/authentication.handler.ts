import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';

import type { RoleUser, User } from '@/types';
import { verifyUserToken } from '@/utils/jwt';
import jwtRedis from '@/utils/jwtRedis';

export const authenticationHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
  params: { required?: boolean; role?: RoleUser[] } = {
    required: false,
    role: []
  }
) => {
  try {
    const userToken: string | undefined | null =
      req.cookies.user_token ||
      req.headers.authorization?.replace('Bearer ', '');

    // console.log(req.headers['user-agent']);

    let user = res.locals.user || null;
    const role = params.role || [];

    const isUsedRole: boolean = role.length > 0;
    const isRequiredAuth: boolean = params.required || isUsedRole;

    if (isRequiredAuth && (!userToken || userToken.length == 0)) {
      throw createHttpError.BadRequest('Token is required');
    }

    if (userToken && userToken.length > 0 && !user) {
      const isAlive = await jwtRedis
        .setRevokePrefix('user_token')
        .verify(userToken);

      if (!isAlive) {
        throw createHttpError.Unauthorized('Token is no longer active');
      }

      user = verifyUserToken(userToken) as User;

      res.locals.userToken = userToken;
      res.locals.user = user;
    }

    if (isRequiredAuth && !user) {
      throw createHttpError.Unauthorized(
        'You need authorized to perform this action'
      );
    }

    if (isRequiredAuth && isUsedRole && user && !role.includes(user.role)) {
      throw createHttpError.Forbidden(
        'You do not have permission to perform this action'
      );
    }

    return next();
  } catch (error) {
    return next(error);
  }
};
