import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import Trending from '@/models/trending';
import RedisCache from '@/config/redis';

class TrendingController extends RedisCache {
  constructor() {
    super();
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const page: number = +req.query?.page! - 1 || 0;
      const limit: number = +req.query?.limit! || 20;
      const key: string = req.originalUrl;
      const dataCache: any = await RedisCache.client.get(key);

      if (dataCache != null) {
        return res.json(JSON.parse(dataCache));
      }

      switch (req.params.slug) {
        case 'all':
          const trending = await Trending.find()
            .skip(page * limit)
            .limit(limit);

          const total = await Trending.countDocuments({});

          const response = {
            page: page + 1,
            results: trending,
            total: total,
            page_size: limit,
          };

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
              `Not found with slug: ${req.params.slug} !`
            )
          );
          break;
      }
    } catch (error) {
      next(error);
    } finally {
    }
  }
}

export default new TrendingController();
