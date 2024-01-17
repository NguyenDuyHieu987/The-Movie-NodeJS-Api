import { ConversationsMessageFile } from '@sendinblue/client';
import type { Algorithm } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';

import { ONE_HOUR } from '@/common';

export const JWT_SIGNATURE_SECRET: string =
  process.env.JWT_SIGNATURE_SECRET!.replace(/\\n/g, '\n');
export const JWT_REFRESH_SECRET: string =
  process.env.JWT_REFRESH_SECRET!.replace(/\\n/g, '\n');

export const JWT_ALGORITHM: Algorithm = 'ES512';
export const JWT_ALLOWED_ALGORITHMS: Algorithm[] = ['ES256', 'ES384', 'ES512'];

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

export function verifyUserToken(token: string) {
  return jwt.verify(token, JWT_SIGNATURE_SECRET, {
    algorithms: JWT_ALLOWED_ALGORITHMS
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
