import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import Account from '@/models/account';
import jwtRedis from '@/utils/jwtRedis';

class AccountController {
  constructor() {
    jwtRedis.setPrefix('user_logout');
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
    } catch (error) {
      next(error);
    }
  }

  async changeEmail(req: Request, res: Response, next: NextFunction) {
    try {
    } catch (error) {
      next(error);
    }
  }

  async verify(req: Request, res: Response, next: NextFunction) {
    try {
    } catch (error) {
      next(error);
    }
  }
}

export default new AccountController();
