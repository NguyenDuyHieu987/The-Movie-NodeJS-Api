import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';

import type { User } from '@/types';

const authenticationHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
  params: { required?: boolean; role?: string[] } = {
    required: false,
    role: []
  }
) => {
  try {
    const user_token: string | undefined | null =
      req.cookies.user_token ||
      req.headers.authorization?.replace('Bearer ', '');

    // console.log(req.headers['user-agent']);

    let user = null;

    if (user_token && user_token.length > 0 && !res.locals.user) {
      user = jwt.verify(user_token, process.env.JWT_SIGNATURE_SECRET!, {
        algorithms: ['HS256']
      }) as User;

      res.locals.userToken = user_token;
      res.locals.user = user;
    }

    if (params.required || !user) {
      return next(
        createHttpError.Unauthorized(
          'You need authorized to perform this action'
        )
      );
    }

    if (!params.role?.includes(user.role)) {
      return next(
        createHttpError.Forbidden(
          'You do not have permission to perform this action'
        )
      );
    }

    return next();
  } catch (error) {
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
