import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';

import RedisCache from '@/config/redis';
import Invoice from '@/models/invoice';

class InvoiceController extends RedisCache {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const key: string = req.originalUrl;
      const dataCache: any = await RedisCache.client.get(key);

      if (dataCache != null) {
        return res.json(JSON.parse(dataCache));
      }

      const data = await Invoice.find().sort({ order: 1 });

      if (data != null) {
        const response = { results: data };

        await RedisCache.client.setEx(
          key,
          +process.env.REDIS_CACHE_TIME!,
          JSON.stringify(response)
        );

        return res.json(response);
      } else {
        return next(createHttpError.NotFound(`Plan is not exist`));
      }
    } catch (error) {
      next(error);
    }
  }
}

export default new InvoiceController();
