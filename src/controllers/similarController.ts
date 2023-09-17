import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import Movie from '@/models/movie';
import TV from '@/models/tv';
import RedisCache from '@/config/redis';

class SimilarController extends RedisCache {
  constructor() {
    super();
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const mediaType: string = req.params.type;
      const movieId: string = req.params.movieId;
      const page: number = +req.query?.page! - 1 || 0;
      const limit: number = +req.query?.limit! || 12;
      const key: string = req.originalUrl;
      const dataCache: any = await RedisCache.client.get(key);
      let similar: any[] = [];

      if (dataCache != null) {
        return res.json(JSON.parse(dataCache));
      }

      switch (mediaType) {
        case 'movie':
          const movie = await Movie.findOne({ id: movieId });

          if (movie != null) {
            const genre: any[] = movie.genres;
            const country: string = movie.original_language!;

            similar = await Movie.find({
              id: {
                $nin: [movieId],
              },
              $or: [
                { original_language: { $regex: country } },
                {
                  genres: {
                    $elemMatch: { $or: [...genre] },
                  },
                },
              ],
            })
              .skip(page * limit)
              .limit(limit)
              .sort({ views: -1 });
          } else {
            return next(createHttpError.NotFound(`Movie is not exist`));
          }
          break;
        case 'tv':
          const tv = await TV.findOne({ id: movieId });

          if (tv != null) {
            const genre: any[] = tv.genres;
            const country: string = tv.original_language!;

            similar = await TV.find({
              id: {
                $nin: [movieId],
              },
              $or: [
                { original_language: { $regex: country } },
                {
                  genres: {
                    $elemMatch: { $or: [...genre] },
                  },
                },
              ],
            })
              .skip(page * limit)
              .limit(limit)
              .sort({ views: -1 });
          } else {
            return next(createHttpError.NotFound(`Movie is not exist`));
          }
          break;
        default:
          return next(
            createHttpError.NotFound(
              `Movie with type: ${mediaType} is not found`
            )
          );
          break;
      }

      const response = {
        page: page + 1,
        results: similar,
        page_size: limit,
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

export default new SimilarController();
