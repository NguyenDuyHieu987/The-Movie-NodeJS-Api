import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import type { Algorithm } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';

import { ONE_DAY, ONE_HOUR } from '@/common';
import { RedisCache } from '@/config/redis';
import Account from '@/models/account';
import { User } from '@/types';

export const JWT_SIGNATURE_SECRET: string =
  process.env.JWT_SIGNATURE_SECRET!.replace(/\\n/g, '\n');
export const JWT_REFRESH_SECRET: string =
  process.env.JWT_REFRESH_SECRET!.replace(/\\n/g, '\n');

export const JWT_ALGORITHM: Algorithm = 'ES512';
export const JWT_ALLOWED_ALGORITHMS: Algorithm[] = [
  'ES256',
  'ES384',
  'ES512',
  'HS512'
];
export const JWT_ALGORITHM_DEFAULT: Algorithm = 'HS512';

export function signDefaultToken(params: object | string) {
  return jwt.sign(
    params instanceof Object
      ? {
          ...params
        }
      : params,
    JWT_SIGNATURE_SECRET,
    {
      algorithm: JWT_ALGORITHM
      // expiresIn: process.env.JWT_ACCESS_EXP_OFFSET! + 'h',
      /*  or */
      // expiresIn: process.env.JWT_ACCESS_EXP_OFFSET! * ONE_HOUR,
    }
  );
}

export function verifyDefaultToken(token: string) {
  return jwt.verify(token, JWT_SIGNATURE_SECRET, {
    algorithms: JWT_ALLOWED_ALGORITHMS
  });
}

export function signUserToken(params: object) {
  return jwt.sign(
    {
      ...params,
      exp:
        Math.floor(Date.now() / 1000) +
        +process.env.JWT_ACCESS_EXP_OFFSET! * ONE_HOUR
    },
    JWT_SIGNATURE_SECRET,
    {
      algorithm: JWT_ALGORITHM
    }
  );
}

export async function verifyUserToken(
  token: string,
  req: Request,
  res: Response,
  next: NextFunction
): Promise<User> {
  return new Promise((resolve, reject) => {
    let decodedUser = null;

    jwt.verify(
      token,
      JWT_SIGNATURE_SECRET,
      {
        algorithms: JWT_ALLOWED_ALGORITHMS
      },
      async (err, decoded) => {
        decodedUser = decoded;

        if (err?.name == jwt.TokenExpiredError.name && !decoded) {
          const refreshToken = req.cookies?.refresh_token;

          const decodedRefeshToken = verifyRefreshToken(refreshToken) as User;

          // const decodedExp = jwt.verify(token, JWT_SIGNATURE_SECRET, {
          //   algorithms: JWT_ALLOWED_ALGORITHMS,
          //   ignoreExpiration: true
          // }) as User;

          const listRefreshToken = await RedisCache.client.get(
            `user_login__${decodedRefeshToken.id}`
          );

          if (!listRefreshToken) {
            throw createHttpError.Unauthorized('Token is no longer active');
          }

          const listRefreshTokenParse: string[] = JSON.parse(listRefreshToken);

          if (!listRefreshTokenParse.includes(refreshToken)) {
            throw createHttpError.Unauthorized('Token is no longer active');
          }

          const account = await Account.findOne({
            id: decodedRefeshToken.id
          });

          if (!account) {
            throw createHttpError.InternalServerError('Account is not exist');
          }

          const encoded = signUserToken({
            id: account.id,
            username: account.username,
            email: account.email,
            full_name: account.full_name,
            avatar: account.avatar,
            role: account.role,
            auth_type: account.auth_type,
            created_at: account.created_at
          });

          res.locals.userToken = encoded;

          res.set('Access-Control-Expose-Headers', 'Authorization');

          res.cookie('user_token', encoded, {
            domain: req.hostname,
            httpOnly: req.session.cookie.httpOnly,
            sameSite: req.session.cookie.sameSite,
            secure: true,
            maxAge: +process.env.JWT_ACCESS_EXP_OFFSET! * ONE_HOUR * 1000
          });

          res.header('Authorization', encoded);

          decodedUser = account;
        }

        if (err?.name == jwt.JsonWebTokenError.name) {
          throw err;
        }

        if (!decodedUser) {
          throw createHttpError.Unauthorized();
        }

        resolve(decodedUser as User);
      }
    );
  });
}

export function signRefreshToken(params: object) {
  return jwt.sign(
    {
      ...params
    },
    JWT_REFRESH_SECRET,
    {
      algorithm: JWT_ALGORITHM,
      expiresIn: +process.env.JWT_REFRESH_EXP_OFFSET! + 'd'
    }
  );
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, JWT_REFRESH_SECRET, {
    algorithms: JWT_ALLOWED_ALGORITHMS
  });
}
