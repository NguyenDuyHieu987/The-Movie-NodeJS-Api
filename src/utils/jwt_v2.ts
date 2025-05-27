import type { CookieOptions, NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import type { Algorithm, JwtPayload } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';

import { ONE_DAY, ONE_HOUR } from '@/common';
import { RedisCache } from '@/config/redis';
import Account from '@/models/account';
import { User } from '@/types';
import jwtRedis from '@/utils/jwtRedis';

export const JWT_SIGNATURE_SECRET: string =
  process.env.JWT_SIGNATURE_SECRET!.replace(/\\n/g, '\n');

export const JWT_SIGNATURE_SECRET_VERIFY: string =
  process.env.JWT_SIGNATURE_SECRET_VERIFY!.replace(/\\n/g, '\n');

export const JWT_REFRESH_SECRET: string =
  process.env.JWT_REFRESH_SECRET!.replace(/\\n/g, '\n');

export const JWT_REFRESH_SECRET_VERIFY: string =
  process.env.JWT_REFRESH_SECRET_VERIFY!.replace(/\\n/g, '\n');

export const JWT_ALGORITHM: Algorithm = 'ES512';
export const JWT_ALLOWED_ALGORITHMS: Algorithm[] = [
  'ES256',
  'ES384',
  'ES512',
  'HS512'
];
export const JWT_ALGORITHM_DEFAULT: Algorithm = 'HS512';

export async function verifyAccessToken(
  token: string,
  req: Request,
  res: Response
): Promise<User> {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      JWT_SIGNATURE_SECRET_VERIFY,
      { algorithms: JWT_ALLOWED_ALGORITHMS },
      async (err, decoded) => {
        if (err) return reject(err);
        if (!decoded) return reject(createHttpError.Unauthorized());

        // const isAlive = await jwtRedis
        //   .setRevokePrefix('user_token')
        //   .verify(token);

        // if (!isAlive)
        //   return reject(
        //     createHttpError.Unauthorized('Token is no longer active')
        //   );

        resolve(decoded as User);
      }
    );
  });
}

export async function verifyAndRefreshToken(
  token: string,
  req: Request,
  res: Response
): Promise<User> {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      JWT_REFRESH_SECRET_VERIFY,
      { algorithms: JWT_ALLOWED_ALGORITHMS },
      async (err, decoded) => {
        if (err) {
          if (err instanceof jwt.TokenExpiredError) {
            return reject(
              createHttpError.Unauthorized('Refresh token has expired')
            );
          } else if (err instanceof jwt.JsonWebTokenError) {
            return reject(
              createHttpError.Unauthorized('Refresh token is invalid')
            );
          } else {
            return reject(
              createHttpError.Unauthorized('Refresh token verification failed')
            );
          }
        }

        if (!decoded)
          return reject(
            createHttpError.Unauthorized('Refresh token is missing')
          );

        const user = decoded as User;
        const tokenList = await RedisCache.client.get(`user_login__${user.id}`);
        if (!tokenList)
          return reject(createHttpError.Unauthorized('Refresh token revoked'));

        const parsedList: string[] = JSON.parse(tokenList);
        if (!parsedList.includes(token))
          return reject(
            createHttpError.Unauthorized('Refresh token not recognized')
          );

        const account = await Account.findOne({ id: user.id });
        if (!account) return reject(createHttpError.NotFound('User not found'));

        const accountData = {
          id: account.id,
          username: account.username,
          email: account.email,
          full_name: account.full_name,
          avatar: account.avatar,
          role: account.role,
          auth_type: account.auth_type,
          created_at: account.created_at
        };

        const newAccessToken = jwt.sign(accountData, JWT_SIGNATURE_SECRET, {
          algorithm: JWT_ALGORITHM,
          expiresIn: +process.env.JWT_ACCESS_EXP_OFFSET! + 'h'
        });

        const newRefreshToken = jwt.sign(accountData, JWT_REFRESH_SECRET, {
          algorithm: JWT_ALGORITHM,
          expiresIn: +process.env.JWT_REFRESH_EXP_OFFSET! + 'd'
        });

        await RedisCache.client.set(
          `user_login__${account.id}`,
          JSON.stringify([
            ...parsedList.filter((t) => t !== token),
            newRefreshToken
          ]),
          { EX: +process.env.JWT_REFRESH_EXP_OFFSET! * ONE_DAY }
        );

        res.cookie('user_token', newAccessToken, {
          ...(req.session.cookie as CookieOptions),
          domain: req.session.cookie.domain,
          httpOnly: req.session.cookie.httpOnly,
          sameSite: req.session.cookie.sameSite,
          secure: true,
          maxAge: +process.env.JWT_ACCESS_EXP_OFFSET! * ONE_HOUR * 1000
        });

        res.cookie('refresh_token', newRefreshToken, {
          ...(req.session.cookie as CookieOptions),
          domain: req.session.cookie.domain,
          httpOnly: req.session.cookie.httpOnly,
          sameSite: req.session.cookie.sameSite,
          secure: true,
          maxAge: +process.env.JWT_REFRESH_EXP_OFFSET! * ONE_DAY * 1000
        });

        res.set('Access-Control-Expose-Headers', 'Authorization');
        res.setHeader('Authorization', newAccessToken);

        resolve(accountData as User);
      }
    );
  });
}
