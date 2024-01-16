import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';

import type { RoleUser, User } from '@/types';
import jwtRedis from '@/utils/jwtRedis';

const authenticationHandler = async (
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

    let user = null;
    const role = params.role || [];

    const isUsedRole: boolean = role.length > 0;
    const isRequiredAuth: boolean = params.required || isUsedRole;

    if (userToken && userToken.length > 0 && !res.locals.user) {
      const isAlive = await jwtRedis.setPrefix('user_logout').verify(userToken);

      if (!isAlive) {
        return next(createHttpError.Unauthorized('Token is no longer active'));
      }

      user = jwt.verify(userToken, process.env.JWT_SIGNATURE_SECRET!, {
        algorithms: ['HS256']
      }) as User;

      res.locals.userToken = userToken;
      res.locals.user = user;
    }

    if (isRequiredAuth && !user) {
      return next(
        createHttpError.Unauthorized(
          'You need authorized to perform this action'
        )
      );
    }

    if (isRequiredAuth && isUsedRole && user && !role.includes(user.role)) {
      return next(
        createHttpError.Forbidden(
          'You do not have permission to perform this action'
        )
      );
    }

    return next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.clearCookie('user_token', {
        domain: req.hostname,
        httpOnly: req.session.cookie.httpOnly,
        sameSite: req.session.cookie.sameSite,
        secure: true
      });
      return next(createHttpError.Unauthorized('Token is expired'));
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.clearCookie('user_token', {
        domain: req.hostname,
        httpOnly: req.session.cookie.httpOnly,
        sameSite: req.session.cookie.sameSite,
        secure: true
      });
      return next(createHttpError.Unauthorized('Token is invalid'));
    }
  }
};

export { authenticationHandler };
