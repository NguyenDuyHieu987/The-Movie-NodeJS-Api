import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';

import { RedisCache } from '@/config/redis';
import Invoice from '@/models/invoice';
import type { User } from '@/types';

export class InvoiceController extends RedisCache {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const skip: number = +req.query.skip! - 1 || 0;
      const limit: number = +req.query.limit! || 20;

      const userToken = res.locals.userToken;
      const user = res.locals.user as User;

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

      result.results = await Invoice.find({ account_id: user.id })
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
      return next(error);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const skip: number = +req.query.skip! - 1 || 0;
      const limit: number = +req.query.limit! || 20;

      const userToken = res.locals.userToken;
      const user = res.locals.user as User;

      const invoice = await Invoice.findOne({
        id: req.params.id,
        account_id: user.id
      })
        .skip(skip * limit)
        .limit(limit)
        .sort({
          created_at: -1
        });

      return res.json({
        success: true,
        result: invoice
      });
    } catch (error) {
      return next(error);
    }
  }
}

export default new InvoiceController();
