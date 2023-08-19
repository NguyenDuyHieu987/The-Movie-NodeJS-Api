import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import MovieSlug from '@/models/movieSlug';
import Movie from '@/models/movie';
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
          data = await Movie.find()
            .skip(page * 20)
            .limit(20);

          total = await Movie.countDocuments({});

          break;
        case 'nowplaying':
          data = await MovieSlug.NowPlaying.find()
            .skip(page * 20)
            .limit(20);

          total = await MovieSlug.NowPlaying.countDocuments({});

          break;
        case 'upcoming':
          data = await MovieSlug.UpComing.find()
            .skip(page * 20)
            .limit(20);

          total = await MovieSlug.UpComing.countDocuments({});

          break;
        case 'popular':
          data = await MovieSlug.Popular.find()
            .skip(page * 20)
            .limit(20);

          total = await MovieSlug.Popular.countDocuments({});

          break;
        case 'toprated':
          data = await MovieSlug.TopRated.find()
            .skip(page * 20)
            .limit(20);

          total = await MovieSlug.TopRated.countDocuments({});

          break;
        default:
          next(
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
