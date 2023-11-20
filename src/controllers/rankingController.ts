import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import Movie from '@/models/movie';
import TV from '@/models/tv';
import RedisCache from '@/config/redis';

class RankingController extends RedisCache {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const page: number = +req.query?.page! - 1 || 0;
      const limit: number = +req.query?.limit! || 20;
      const key: string = req.originalUrl;
      const dataCache: any = await RedisCache.client.get(key);

      if (dataCache != null) {
        return res.json(JSON.parse(dataCache));
      }

      let data: any[] = [];
      let total: number = 0;

      switch (req.params.slug) {
        case 'day':
          const movie1 = await Movie.find()
            .skip(0 * (limit / 2))
            .limit(limit / 2)
            .sort({ views: -1 });

          const tv1 = await TV.find()
            .skip(0 * (limit / 2))
            .limit(limit / 2)
            .sort({ views: -1 });

          data = movie1.concat(tv1);

          total = await Movie.countDocuments({});
          break;
        case 'week':
          const movie2 = await Movie.find()
            .skip(1 * (limit / 2))
            .limit(limit / 2)
            .sort({ views: -1 });

          const tv2 = await TV.find()
            .skip(1 * (limit / 2))
            .limit(limit / 2)
            .sort({ views: -1 });

          data = movie2.concat(tv2);

          total = await Movie.countDocuments({});
          break;
        case 'month':
          const movie3 = await Movie.find()
            .skip(2 * (limit / 2))
            .limit(limit / 2)
            .sort({ views: -1 });

          const tv3 = await TV.find()
            .skip(2 * (limit / 2))
            .limit(limit / 2)
            .sort({ views: -1 });

          data = movie3.concat(tv3);

          total = await Movie.countDocuments({});
          break;
        case 'all':
          const movie4 = await Movie.find()
            .skip(3 * (limit / 2))
            .limit(limit / 2)
            .sort({ views: -1 });

          const tv4 = await TV.find()
            .skip(3 * (limit / 2))
            .limit(limit / 2)
            .sort({ views: -1 });

          data = movie4.concat(tv4);

          total = await Movie.countDocuments({});
          break;
        default:
          return next(
            createHttpError.NotFound(
              `Not found with slug: ${req.params.slug} !`
            )
          );
          break;
      }

      const response = {
        page: page + 1,
        results: data,
        page_size: limit,
      };

      await RedisCache.client.setEx(
        key,
        +process.env.REDIS_CACHE_TIME!,
        JSON.stringify(response)
      );

      return res.json(response);
    } catch (error) {
      next(error);
    } finally {
    }
  }
}

export default new RankingController();
