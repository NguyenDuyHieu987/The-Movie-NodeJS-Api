import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';

import RedisCache from '@/config/redis';
import Invoice from '@/models/invoice';
import type { user } from '@/types';

class BillController extends RedisCache {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const skip: number = +req.query.skip! - 1 || 0;
      const limit: number = +req.query.limit! || 20;

      const user_token =
        req.cookies.user_token ||
        req.headers.authorization!.replace('Bearer ', '');

      const user = jwt.verify(
        user_token,
        process.env.JWT_SIGNATURE_SECRET!
      ) as user;

      const result: {
        skip: number;
        results: any[];
        limit: number;
        total: number;
      } = {
        skip: skip + 1,
        results: [],
        limit,
        total: 0
      };

      result.results = await Invoice.aggregate()
        .match({
          account_id: user.id
        })
        .project({
          id: 1,
          description: 1,
          unit_amount: 1,
          quantity: 1,
          amount_total: 1,
          amount_due: 1,
          amount_paid: 1,
          amount_remaining: 1,
          amount_discount: 1,
          amount_tax: 1,
          currency: 1,
          status: 1,
          payment_status: 1,
          payment_method: 1,
          period_start: 1,
          period_end: 1,
          created_at: 1,
          updated_at: 1
        })
        .skip(skip * limit)
        .limit(limit)
        .sort({
          created_at: -1
        });

      result.total = await Invoice.countDocuments({
        account_id: user.id
      });

      return res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new BillController();
