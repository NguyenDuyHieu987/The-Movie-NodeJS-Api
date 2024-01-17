import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';

import { ONE_HOUR } from '@/common';
import { APP_TOKEN_SECRET } from '@/constants';
import Login from '@/models/login';
import type { User } from '@/types';

export class LoginController {
  constructor() {}

  async getAll(req: Request, res: Response, next: NextFunction) {}
}

export default new LoginController();
