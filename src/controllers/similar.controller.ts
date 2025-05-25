import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';

import { RedisCache } from '@/config/redis';
import Movie from '@/models/movie';
import * as Utils from '../utils';

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
      const movie = await Movie.findOne({
        id: movieId
      });

      if (movie == null) {
        throw createHttpError.NotFound(`Movie is not exist`);
      }

      const genre: any[] = movie.genres;
      const genreIds = Array.isArray(genre)
        ? movie.genres.map((g) => g.id)
        : [];
      const country: string[] = Utils.isString(movie.origin_country)
        ? [movie.origin_country]
        : movie.origin_country;

      switch (mediaType) {
        case 'all':
          similar = await Movie.find({
            id: {
              $nin: [movieId]
            },
            $or: [
              { origin_country: { $in: country } },
              genre.length > 0
                ? //  {
                  //     genres: {
                  //       $elemMatch: { $or: [...genre] }
                  //     }
                  //   }
                  { 'genres.id': { $in: genreIds } }
                : {}
            ]
          })
            .skip(page * limit)
            .limit(limit)
            .sort({ views: -1 });
          break;
        case 'movie':
          similar = await Movie.find({
            id: {
              $nin: [movieId]
            },
            media_type: 'movie',
            $or: [
              { origin_country: { $in: country } },
              genre.length > 0 ? { 'genres.id': { $in: genreIds } } : {}
            ]
          })
            .skip(page * limit)
            .limit(limit)
            .sort({ views: -1 });
          break;
        case 'tv':
          similar = await Movie.find({
            id: {
              $nin: [movieId]
            },
            media_type: 'tv',
            $or: [
              { origin_country: { $in: country } },
              genre.length > 0 ? { 'genres.id': { $in: genreIds } } : {}
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
