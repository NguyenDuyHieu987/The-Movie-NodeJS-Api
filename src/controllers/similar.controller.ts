import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';

import { RedisCache } from '@/config/redis';
import Movie from '@/models/movie';

export class SimilarController extends RedisCache {
  constructor() {
    super();
  }

  async getSlug(req: Request, res: Response, next: NextFunction) {
    try {
      const mediaType: string = req.params.type;
      const movieId: string = req.params.movieId;
      const page: number = +req.query.page! - 1 || 0;
      const limit: number = +req.query.limit! || 12;
      const key: string = req.originalUrl;
      const dataCache: any = await RedisCache.client.get(key);
      let similar: any[] = [];

      if (dataCache != null) {
        return res.json(JSON.parse(dataCache));
      }

      switch (mediaType) {
        case 'all':
          const movie = await Movie.findOne({
            id: movieId
          });

          if (movie == null) {
            throw createHttpError.NotFound(`Movie is not exist`);
          }

          const genre: any[] = movie.genres;
          const country: string = movie.original_language!;

          similar = await Movie.find({
            id: {
              $nin: [movieId]
            },
            $or: [
              { original_language: { $regex: country } },
              {
                genres: {
                  $elemMatch: genre.length > 0 ? { $or: [...genre] } : {}
                }
              }
            ]
          })
            .skip(page * limit)
            .limit(limit)
            .sort({ views: -1 });

          break;
        case 'movie':
          const movie1 = await Movie.findOne({
            id: movieId,
            media_type: 'movie'
          });

          if (movie1 == null) {
            throw createHttpError.NotFound(`Movie is not exist`);
          }

          const genre1: any[] = movie1.genres;
          const country1: string = movie1.original_language!;

          similar = await Movie.find({
            id: {
              $nin: [movieId]
            },
            media_type: 'movie',
            $or: [
              { original_language: { $regex: country1 } },
              {
                genres: {
                  $elemMatch: genre1.length > 0 ? { $or: [...genre1] } : {}
                }
              }
            ]
          })
            .skip(page * limit)
            .limit(limit)
            .sort({ views: -1 });

          break;
        case 'tv':
          const tv = await Movie.findOne({ id: movieId, media_type: 'tv' });

          if (tv == null) {
            throw createHttpError.NotFound(`Movie is not exist`);
          }

          const genre2: any[] = tv.genres;
          const country2: string = tv.original_language!;

          similar = await Movie.find({
            id: {
              $nin: [movieId]
            },
            media_type: 'tv',
            $or: [
              { original_language: { $regex: country2 } },
              {
                genres: {
                  $elemMatch: genre2.length > 0 ? { $or: [...genre2] } : {}
                }
              }
            ]
          })
            .skip(page * limit)
            .limit(limit)
            .sort({ views: -1 });

          break;
        default:
          return next(
            createHttpError.NotFound(
              `Movie with type: ${mediaType} is not found`
            )
          );
      }

      const response = {
        page: page + 1,
        results: similar,
        page_size: limit
      };

      await RedisCache.client.setEx(
        key,
        +process.env.REDIS_CACHE_TIME!,
        JSON.stringify(response)
      );

      return res.json(response);
    } catch (error) {
      return next(error);
    }
  }
}

export default new SimilarController();
