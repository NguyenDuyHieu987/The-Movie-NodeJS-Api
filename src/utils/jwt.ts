import type { Algorithm } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';

export const JWT_ALGORITHM: Algorithm = 'ES512';

export const JWT_ALLOWED_ALGORITHMS: Algorithm[] = ['ES256', 'ES384', 'ES512'];

export function signDefaultToken(params: object | string) {
  return jwt.sign(
    params instanceof Object
      ? {
          ...params
        }
      : params,
    process.env.JWT_SIGNATURE_SECRET!,
    {
      algorithm: JWT_ALGORITHM
      // expiresIn: process.env.JWT_ACCESS_EXP_OFFSET! + 'h',
      /*  or */
      // expiresIn: process.env.JWT_ACCESS_EXP_OFFSET! * 3600,
    }
  );
}

export function verifyDefaultToken(token: string) {
  return jwt.verify(token, process.env.JWT_SIGNATURE_SECRET!, {
    algorithms: JWT_ALLOWED_ALGORITHMS
  });
}

export function signUserToken(params: object) {
  return jwt.sign(
    {
      ...params,
      exp:
        Math.floor(Date.now() / 1000) +
        +process.env.JWT_ACCESS_EXP_OFFSET! * 3600
    },
    process.env.JWT_SIGNATURE_SECRET!,
    {
      algorithm: JWT_ALGORITHM
    }
  );
}

export function verifyUserToken(token: string) {
  return jwt.verify(token, process.env.JWT_SIGNATURE_SECRET!, {
    algorithms: JWT_ALLOWED_ALGORITHMS
  });
}

export function signRefreshToken(params: object) {
  return jwt.sign(
    {
      ...params
    },
    process.env.JWT_REFRESH_SECRET!,
    {
      algorithm: JWT_ALGORITHM,
      expiresIn: '1y'
    }
  );
}
