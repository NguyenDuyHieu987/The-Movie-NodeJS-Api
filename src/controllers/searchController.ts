import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import Movie from '@/models/movie';
import TV from '@/models/tv';
import RedisCache from '@/config/redis';

class SearchController extends RedisCache {
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const key: string = req.originalUrl;
      const dataCache: any = await RedisCache.client.get(key);

      const query: string = (req.query.query as string) || '';
      const page: number = +req.query?.page! - 1 || 0;
      const limit: number = +req.query?.limit! || 20;

      if (dataCache != null) {
        return res.json(JSON.parse(dataCache));
      }

      let result: {
        page: number;
        results: any[];
        page_size: number;
        total: number;
        tv?: any[];
        movie?: any[];
        total_movie?: number;
        total_tv?: number;
      } = {
        page: page + 1,
        results: [],
        page_size: limit,
        total: 0,
      };

      switch (req.params.type) {
        case 'all':
          const movie = await Movie.find({
            $or: [
              { name: { $regex: query, $options: 'i' } },
              { original_name: { $regex: query, $options: 'i' } },
            ],
          })
            .skip(page * (limit / 2))
            .limit(limit / 2)
            .sort({ views: -1 });

          const tv = await TV.find({
            $or: [
              { name: { $regex: query, $options: 'i' } },
              { original_name: { $regex: query, $options: 'i' } },
            ],
          })
            .skip(page * (limit / 2))
            .limit(limit / 2)
            .sort({ views: -1 });

          result.results = movie.concat(tv);

          const totalMovie = await Movie.countDocuments({
            $or: [
              { name: { $regex: query, $options: 'i' } },
              { original_name: { $regex: query, $options: 'i' } },
            ],
          });

          const totalTv = await TV.countDocuments({
            $or: [
              { name: { $regex: query, $options: 'i' } },
              { original_name: { $regex: query, $options: 'i' } },
            ],
          });

          result.total = totalMovie + totalTv;
          result.movie = movie;
          result.tv = tv;
          result.total_movie = totalMovie;
          result.total_tv = totalTv;
          break;
        case 'movie':
          result.results = await Movie.find({
            $or: [
              { name: { $regex: query, $options: 'i' } },
              { original_name: { $regex: query, $options: 'i' } },
            ],
          })
            .skip(page * limit)
            .limit(limit)
            .sort({ views: -1 });

          result.total = await Movie.countDocuments({
            $or: [
              { name: { $regex: query, $options: 'i' } },
              { original_name: { $regex: query, $options: 'i' } },
            ],
          });
          break;
        case 'tv':
          result.results = await TV.find({
            $or: [
              { name: { $regex: query, $options: 'i' } },
              { original_name: { $regex: query, $options: 'i' } },
            ],
          })
            .skip(page * limit)
            .limit(limit)
            .sort({ views: -1 });

          result.total = await TV.countDocuments({
            $or: [
              { name: { $regex: query, $options: 'i' } },
              { original_name: { $regex: query, $options: 'i' } },
            ],
          });
          break;
        default:
          return next(
            createHttpError.NotFound(
              `Search with type: ${req.params.type} is not found!`
            )
          );
          break;
      }

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

export default new SearchController();
