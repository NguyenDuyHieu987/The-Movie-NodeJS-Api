import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';

import RedisCache from '@/config/redis';
import Year from '@/models/year';

class YearController extends RedisCache {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const key: string = req.originalUrl;
      const dataCache: any = await RedisCache.client.get(key);

      if (dataCache != null) {
        return res.json(JSON.parse(dataCache));
      }

      switch (req.params.slug) {
        case 'all':
          const data = await Year.find();

          const response = { results: data };

          await RedisCache.client.setEx(
            key,
            +process.env.REDIS_CACHE_TIME!,
            JSON.stringify(response)
          );

          return res.json(response);
          break;
        default:
          return next(
            createHttpError.NotFound(
              `Years with slug: ${req.params.slug} is not found!`
            )
          );
          break;
      }
    } catch (error) {
      next(error);
    }
  }
}

export default new YearController();
