import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';

import { RedisCache } from '@/config/redis';
import TV from '@/models/tv';
import TvSlug from '@/models/tvSlug';

export class MovieSlugController extends RedisCache {
  async getSlug(req: Request, res: Response, next: NextFunction) {
    try {
      const page: number = +req.query.page! - 1 || 0;
      const limit: number = +req.query.limit! || 20;
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
            .skip(page * limit)
            .limit(limit);

          total = await TV.countDocuments({});
          break;
        case 'airingtoday':
          data = await TvSlug.AiringToday.find()
            .skip(page * limit)
            .limit(limit);

          total = await TvSlug.AiringToday.countDocuments({});
          break;
        case 'ontheair':
          data = await TvSlug.OnTheAir.find()
            .skip(page * limit)
            .limit(limit);

          total = await TvSlug.OnTheAir.countDocuments({});
          break;
        case 'popular':
          data = await TvSlug.Popular.find()
            .skip(page * limit)
            .limit(limit);

          total = await TvSlug.Popular.countDocuments({});
          break;
        case 'toprated':
          data = await TvSlug.TopRated.find()
            .skip(page * limit)
            .limit(limit);

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
        total,
        page_size: 20
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

  async filter(req: Request, res: Response, next: NextFunction) {
    try {
      const page: number = +req.query.page! - 1 || 0;
      const limit: number = +req.query.limit! || 20;
      const key: string = req.originalUrl;
      const dataCache: any = await RedisCache.client.get(key);

      // if (dataCache != null) {
      //   return res.json(JSON.parse(dataCache));
      // }

      const sortBy: string = (req.query?.sort_by as string) || '';

      const primaryReleaseDateGte: string =
        (req.query?.primary_release_date_gte as string) || '';

      const primaryReleaseDateLte: string =
        (req.query?.primary_release_date_lte as string) || '';

      const withGenres: string = (req.query?.with_genres as string) || '';

      const withOriginalLanguage: string =
        (req.query?.with_original_language as string) || '';

      const convertFirstAirDate = (date_gte: string, data_lte: string) => {
        if (date_gte != '') {
          return {
            first_air_date: {
              $gte: date_gte,
              $lte: data_lte
            }
          };
        } else if (date_gte == '' && data_lte != '') {
          return {
            first_air_date: {
              $lte: data_lte
            }
          };
        } else return {};
      };

      const firstAirDate = convertFirstAirDate(
        primaryReleaseDateGte,
        primaryReleaseDateLte
      );

      const convertGenres = (genre: string) => {
        if (genre != '') {
          return {
            genres: {
              $elemMatch: {
                id: +withGenres
              }
            }
          };
        } else return {};
      };

      const genres = convertGenres(withGenres);

      const convertOriginalLanguage = (language: string) => {
        if (language != '') {
          return { original_language: { $regex: withOriginalLanguage } };
        } else return {};
      };

      const originalLanguage = convertOriginalLanguage(withOriginalLanguage);

      const result: {
        page: number;
        results: any[];
        page_size: number;
        total: number;
      } = {
        page: page + 1,
        results: [],
        page_size: limit,
        total: 0
      };

      switch (req.params.slug) {
        case 'all':
          switch (sortBy) {
            case 'views_desc':
              result.results = await TV.find({
                $and: [firstAirDate, genres, originalLanguage]
              })
                .skip(page * limit)
                .limit(limit)
                .sort({ views: -1 });
              break;
            case 'release_date_desc':
              result.results = await TV.find({
                $and: [firstAirDate, genres, originalLanguage]
              })
                .skip(page * limit)
                .limit(limit)
                .sort({ first_air_date: -1 });
              break;
            case 'revenue_desc':
              result.results = await TV.find({
                $and: [firstAirDate, genres, originalLanguage]
              })
                .skip(page * limit)
                .limit(limit)
                .sort({ revenue: -1 });
              break;
            case 'vote_average_desc':
              result.results = await TV.find({
                $and: [firstAirDate, genres, originalLanguage]
              })
                .skip(page * limit)
                .limit(limit)
                .sort({ vote_average: -1 });
              break;
            case 'vote_count_desc':
              result.results = await TV.find({
                $and: [firstAirDate, genres, originalLanguage]
              })
                .skip(page * limit)
                .limit(limit)
                .sort({ vote_count: -1 });
              break;
            case '':
              result.results = await TV.find({
                $and: [firstAirDate, genres, originalLanguage]
              })
                .skip(page * limit)
                .limit(limit);
              break;
            default:
              return next(
                createHttpError.NotFound(
                  `Discover with sort by: ${sortBy} is not found!`
                )
              );
              break;
          }

          result.total = await TV.countDocuments({
            $and: [firstAirDate, genres, originalLanguage]
          });
          break;
        case 'airingtoday':
          result.results = await TvSlug.AiringToday.find({
            $and: [firstAirDate, genres, originalLanguage]
          })
            .skip(page * limit)
            .limit(limit);

          result.total = await TvSlug.AiringToday.countDocuments({
            $and: [firstAirDate, genres, originalLanguage]
          });
          break;
        case 'ontheair':
          result.results = await TvSlug.OnTheAir.find({
            $and: [firstAirDate, genres, originalLanguage]
          })
            .skip(page * limit)
            .limit(limit);

          result.total = await TvSlug.OnTheAir.countDocuments({
            $and: [firstAirDate, genres, originalLanguage]
          });
          break;
        case 'popular':
          result.results = await TvSlug.Popular.find({
            $and: [firstAirDate, genres, originalLanguage]
          })
            .skip(page * limit)
            .limit(limit);

          result.total = await TvSlug.Popular.countDocuments({
            $and: [firstAirDate, genres, originalLanguage]
          });
          break;
        case 'toprated':
          result.results = await TvSlug.TopRated.find({
            $and: [firstAirDate, genres, originalLanguage]
          })
            .skip(page * limit)
            .limit(limit);

          result.total = await TvSlug.TopRated.countDocuments({
            $and: [firstAirDate, genres, originalLanguage]
          });
          break;
        default:
          return next(
            createHttpError.NotFound(
              `Movies with slug: ${req.params.slug} is not found!`
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
      return next(error);
    }
  }
}

export default new MovieSlugController();
