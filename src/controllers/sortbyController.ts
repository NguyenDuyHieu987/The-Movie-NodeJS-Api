import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';

import RedisCache from '@/config/redis';
import SortOption from '@/models/sortby';

class SortOptionController extends RedisCache {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const key: string = req.originalUrl;
      const dataCache: any = await RedisCache.client.get(key);

      if (dataCache != null) {
        return res.json(JSON.parse(dataCache));
      }

      const data = await SortOption.find();

      const response = { results: data };

      await RedisCache.client.setEx(
        key,
        +process.env.REDIS_CACHE_TIME!,
        JSON.stringify(response)
      );

      return res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export default new SortOptionController();
