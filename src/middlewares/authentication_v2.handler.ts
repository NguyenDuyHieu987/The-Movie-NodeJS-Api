import type { CookieOptions, NextFunction, Request, Response } from 'express';
import createHttpError, { HttpError } from 'http-errors';
import jwt from 'jsonwebtoken';

import type { RoleUser, User } from '@/types';
import { isStringEmpty } from '@/utils';
import { verifyAccessToken, verifyAndRefreshToken } from '@/utils/jwt_v2';

export async function authenticationHandler(
  req: Request,
  res: Response,
  next: NextFunction,
  params: { required?: boolean; role?: RoleUser[] } = {
    required: false,
    role: []
  }
) {
  try {
    const accessToken =
      req.cookies?.user_token ||
      req.headers.authorization?.replace('Bearer ', '');
    const refreshToken = req.cookies?.refresh_token;

    const roleRequired = params.role ?? [];
    const isRoleRequired = roleRequired.length > 0;
    const isAuthRequired = params.required || isRoleRequired;

    let user: User | null = res.locals.user ?? null;

    if (accessToken) {
      try {
        user = await verifyAccessToken(accessToken, req, res);
        res.locals.user = user;
      } catch (err) {
        if (err instanceof jwt.TokenExpiredError && refreshToken) {
          try {
            const newUser = await verifyAndRefreshToken(refreshToken, req, res);
            res.locals.user = newUser;
            user = newUser;
          } catch (refreshErr) {
            clearAuthCookies(req, res);
            throw createHttpError.Unauthorized('Session expired.');
          }
        } else {
          clearAuthCookies(req, res);
          throw createHttpError.Unauthorized('Invalid token.');
        }
      }
    }

    if (!user && !accessToken && refreshToken) {
      try {
        const newUser = await verifyAndRefreshToken(refreshToken, req, res);
        res.locals.user = newUser;
        user = newUser;
      } catch (refreshErr) {
        clearAuthCookies(req, res);
        throw createHttpError.Unauthorized('Session expired.');
      }
    }

    if (isAuthRequired && !user) {
      throw createHttpError.Unauthorized('Authentication required.');
    }

    if (
      isAuthRequired &&
      isRoleRequired &&
      user &&
      !roleRequired.includes(user.role)
    ) {
      throw createHttpError.Forbidden(
        'You do not have permission to perform this action.'
      );
    }

    return next();
  } catch (err) {
    next(err);
  }
}

function clearAuthCookies(req: Request, res: Response) {
  res.clearCookie('user_token', {
    ...(req.session.cookie as CookieOptions),
    domain: req.session.cookie.domain,
    httpOnly: req.session.cookie.httpOnly,
    sameSite: req.session.cookie.sameSite,
    secure: true
  });

  res.clearCookie('refresh_token', {
    ...(req.session.cookie as CookieOptions),
    domain: req.session.cookie.domain,
    httpOnly: req.session.cookie.httpOnly,
    sameSite: req.session.cookie.sameSite,
    secure: true
  });
}
