import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import TvSlug from '@/models/tvSlug';
import TV from '@/models/tv';
import RedisCache from '@/config/redis';

class MovieSlugController extends RedisCache {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const page: number = +req.query?.page! - 1 || 0;
      const key: string = req.originalUrl;
      const dataCache: any = await RedisCache.client.get(key);

      if (dataCache != null) {
        return res.json(JSON.parse(dataCache));
      }

      let data: any[] = [];
      let total: number = 0;

      switch (req.params.slug) {
        case 'all':
          data = await TV.find()
            .skip(page * 20)
            .limit(20);

          total = await TV.countDocuments({});
          break;
        case 'airingtoday':
          data = await TvSlug.AiringToday.find()
            .skip(page * 20)
            .limit(20);

          total = await TvSlug.AiringToday.countDocuments({});
          break;
        case 'ontheair':
          data = await TvSlug.OnTheAir.find()
            .skip(page * 20)
            .limit(20);

          total = await TvSlug.OnTheAir.countDocuments({});
          break;
        case 'popular':
          data = await TvSlug.Popular.find()
            .skip(page * 20)
            .limit(20);

          total = await TvSlug.Popular.countDocuments({});
          break;
        case 'toprated':
          data = await TvSlug.TopRated.find()
            .skip(page * 20)
            .limit(20);

          total = await TvSlug.TopRated.countDocuments({});
          break;
        default:
          return next(
            createHttpError.NotFound(
              `Movies with slug: ${req.params.slug} is not found!`
            )
          );
          break;
      }

      const response = {
        page: page + 1,
        results: data,
        total: total,
        page_size: 20,
      };

      await RedisCache.client.setEx(
        key,
        +process.env.REDIS_CACHE_TIME!,
        JSON.stringify(response)
      );

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export default new MovieSlugController();
