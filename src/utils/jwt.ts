import type { NextFunction, Request, Response } from 'express';
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

export async function signDefaultToken(
  payload: object | string,
  option?: {
    signature?: string;
    algorithm?: Algorithm;
    prefix: string;
    oldToken: string;
  }
) {
  if (option && option.prefix && option.oldToken) {
    jwtRedis.setRevokePrefix(option.prefix);

    await jwtRedis.sign(option.oldToken, {
      EX: +process.env.JWT_ACCESS_EXP_OFFSET! * ONE_HOUR
    });
  }

  return jwt.sign(
    payload instanceof Object
      ? {
          ...payload
        }
      : payload,
    option?.signature || JWT_SIGNATURE_SECRET,
    {
      algorithm: option?.algorithm || JWT_ALGORITHM
      // expiresIn: process.env.JWT_ACCESS_EXP_OFFSET! + 'h',
      /*  or */
      // expiresIn: process.env.JWT_ACCESS_EXP_OFFSET! * ONE_HOUR,
    }
  );
}

export async function verifyDefaultToken(
  token: string,
  option: {
    signature?: string;
    prefix: string;
  }
): Promise<JwtPayload | string> {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      option?.signature || JWT_SIGNATURE_SECRET_VERIFY,
      {
        algorithms: JWT_ALLOWED_ALGORITHMS
      },
      async (err, decoded) => {
        if (err) return reject(err);

        if (!decoded) {
          return reject(createHttpError.Unauthorized());
        }

        if (decoded) {
          const isAlive = await jwtRedis
            .setRevokePrefix(option.prefix)
            .verify(token);

          if (!isAlive) {
            reject(createHttpError.Unauthorized('Token is no longer active'));
          }
        }

        return resolve(decoded as JwtPayload | string);
      }
    );
  });
}

export async function signUserToken(account: object, oldUserToken?: string) {
  if (oldUserToken) {
    jwtRedis.setRevokePrefix('user_token');

    await jwtRedis.sign(oldUserToken, {
      EX: +process.env.JWT_ACCESS_EXP_OFFSET! * ONE_HOUR
    });
  }

  return jwt.sign(
    {
      ...account,
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
      JWT_SIGNATURE_SECRET_VERIFY,
      {
        algorithms: JWT_ALLOWED_ALGORITHMS
      },
      async (err, decoded) => {
        if (decoded) {
          const isAlive = await jwtRedis
            .setRevokePrefix('user_token')
            .verify(token);

          if (!isAlive) {
            return reject(
              createHttpError.Unauthorized('Token is no longer active')
            );
          }
        }

        decodedUser = decoded;

        if (err?.name == jwt.TokenExpiredError.name) {
          const oldRefreshToken = req.cookies?.refresh_token;

          const decodedRefeshToken = (await verifyRefreshToken(
            oldRefreshToken,
            req,
            res
          )) as User;

          const account = await Account.findOne({
            id: decodedRefeshToken.id
          });

          if (!account) {
            return reject(
              createHttpError.InternalServerError('Account is not exist')
            );
          }

          const accountInfo = {
            id: account.id,
            username: account.username,
            email: account.email,
            full_name: account.full_name,
            avatar: account.avatar,
            role: account.role,
            auth_type: account.auth_type,
            created_at: account.created_at
          };

          const userToken = await signUserToken(accountInfo);

          const refreshToken = await signRefreshToken(
            accountInfo,
            oldRefreshToken
          );

          res.locals.userToken = userToken;

          res.set('Access-Control-Expose-Headers', 'Authorization');

          res.cookie('user_token', userToken, {
            domain: req.hostname,
            httpOnly: req.session.cookie.httpOnly,
            sameSite: req.session.cookie.sameSite,
            secure: true,
            maxAge: +process.env.JWT_ACCESS_EXP_OFFSET! * ONE_HOUR * 1000
          });

          res.cookie('refresh_token', refreshToken, {
            domain: req.hostname,
            httpOnly: req.session.cookie.httpOnly,
            sameSite: req.session.cookie.sameSite,
            secure: true,
            maxAge: +process.env.JWT_REFRESH_EXP_OFFSET! * ONE_DAY * 1000
          });

          res.header('Authorization', userToken);

          decodedUser = account;
        }

        if (err?.name == jwt.JsonWebTokenError.name) {
          res.clearCookie('user_token', {
            domain: req.hostname,
            httpOnly: req.session.cookie.httpOnly,
            sameSite: req.session.cookie.sameSite,
            secure: true
          });

          res.clearCookie('refresh_token', {
            domain: req.hostname,
            httpOnly: req.session.cookie.httpOnly,
            sameSite: req.session.cookie.sameSite,
            secure: true
          });

          return reject(err);
        }

        if (!decodedUser) {
          return reject(createHttpError.Unauthorized());
        }

        return resolve(decodedUser as User);
      }
    );
  });
}

export async function signRefreshToken(account: any, oldRefreshToken?: string) {
  const refreshToken = jwt.sign(
    {
      ...account
    },
    JWT_REFRESH_SECRET,
    {
      algorithm: JWT_ALGORITHM,
      expiresIn: +process.env.JWT_REFRESH_EXP_OFFSET! + 'd'
    }
  );

  const listRefreshToken = await RedisCache.client.get(
    `user_login__${account.id}`
  );

  if (listRefreshToken) {
    let listRefreshTokenParse: string[] = JSON.parse(listRefreshToken);

    if (oldRefreshToken && listRefreshTokenParse.includes(oldRefreshToken)) {
      listRefreshTokenParse = listRefreshTokenParse?.filter(
        (item) => item != oldRefreshToken
      );
    }

    await RedisCache.client.set(
      `user_login__${account.id}`,
      JSON.stringify([...listRefreshTokenParse, refreshToken]),
      {
        EX: +process.env.JWT_REFRESH_EXP_OFFSET! * ONE_DAY
      }
    );
  } else {
    await RedisCache.client.set(
      `user_login__${account.id}`,
      JSON.stringify([refreshToken]),
      {
        EX: +process.env.JWT_REFRESH_EXP_OFFSET! * ONE_DAY
      }
    );
  }

  return refreshToken;
}

export async function verifyRefreshToken(
  token: string,
  req: Request,
  res: Response
): Promise<User> {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      JWT_REFRESH_SECRET_VERIFY,
      {
        algorithms: JWT_ALLOWED_ALGORITHMS
      },
      async (err, decoded) => {
        if (err) {
          if (
            err?.name == jwt.JsonWebTokenError.name &&
            err?.name != jwt.TokenExpiredError.name
          ) {
            res.clearCookie('refresh_token', {
              domain: req.hostname,
              httpOnly: req.session.cookie.httpOnly,
              sameSite: req.session.cookie.sameSite,
              secure: true
            });
          }

          return reject(err);
        }

        if (!decoded) {
          return reject(createHttpError.Unauthorized());
        }

        const decodedRefeshToken = decoded as User;

        const listRefreshToken = await RedisCache.client.get(
          `user_login__${decodedRefeshToken.id}`
        );

        if (!listRefreshToken) {
          return reject(
            createHttpError.Unauthorized('Token is no longer active')
          );
        }

        const listRefreshTokenParse: string[] = JSON.parse(listRefreshToken);

        if (!listRefreshTokenParse.includes(token)) {
          return reject(
            createHttpError.Unauthorized('Token is no longer active')
          );
        }

        return resolve(decodedRefeshToken);
      }
    );
  });
}
