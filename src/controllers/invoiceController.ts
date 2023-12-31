import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';

import RedisCache from '@/config/redis';
import Invoice from '@/models/invoice';
import type { user } from '@/types';

class InvoiceController extends RedisCache {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const skip: number = +req.query.skip! - 1 || 0;
      const limit: number = +req.query.limit! || 20;
      const key: string = req.originalUrl;
      const dataCache: any = await RedisCache.client.get(key);

      if (dataCache != null) {
        return res.json(JSON.parse(dataCache));
      }

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

      result.results = await Invoice.find({ account_id: user.id })
        .skip(skip * limit)
        .limit(limit)
        .sort({
          created_at: -1
        });

      result.total = await Invoice.countDocuments({
        account_id: user.id
      });

      await RedisCache.client.setEx(
        key,
        +process.env.REDIS_CACHE_TIME!,
        JSON.stringify(result)
      );

      return res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new InvoiceController();
