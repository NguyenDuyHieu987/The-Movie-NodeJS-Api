import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import SortOption from '@/models/sortby';
import RedisCache from '@/config/redis';

class SortOptionController extends RedisCache {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const key: string = req.originalUrl;
      const dataCache: any = await RedisCache.client.get(key);

      if (dataCache != null) {
        return res.json(JSON.parse(dataCache));
      }

      switch (req.params.slug) {
        case 'all':
          const data = await SortOption.find();

          const response = { results: data };

          await RedisCache.client.setEx(
            key,
            +process.env.REDIS_CACHE_TIME!,
            JSON.stringify(response)
          );

          res.json(response);
          break;
        default:
          next(
            createHttpError.NotFound(
              `Sort options with slug: ${req.params.slug} is not found!`
            )
          );
          break;
      }
    } catch (error) {
      next(error);
    }
  }
}

export default new SortOptionController();
