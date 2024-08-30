import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';

import { RedisCache } from '@/config/redis';
import Movie from '@/models/movie';

export class DiscoverController extends RedisCache {
  async getSlug(req: Request, res: Response, next: NextFunction) {
    try {
      const page: number = +req.query.page! - 1 || 0;
      const limit: number = +req.query.limit! || 20;
      const key: string = req.originalUrl;
      const dataCache: any = await RedisCache.client.get(key);

      if (dataCache != null) {
        return res.json(JSON.parse(dataCache));
      }

      const sortBy: string = (req.query?.sort_by as string) || '';

      const primaryReleaseDateGte: string =
        (req.query?.primary_release_date_gte as string) || '';

      const primaryReleaseDateLte: string =
        (req.query?.primary_release_date_lte as string) || '';

      const withGenres: string = (req.query?.with_genres as string) || '';

      const withOriginalLanguage: string =
        (req.query?.with_original_language as string) || '';

      const convertReleaseDate = (date_gte: string, data_lte: string) => {
        if (date_gte != '' && data_lte != '') {
          return {
            release_date: {
              $gte: date_gte,
              $lte: data_lte
            }
          };
        } else if (date_gte == '' && data_lte != '') {
          return {
            release_date: {
              $lte: data_lte
            }
          };
        } else if (date_gte != '' && data_lte == '') {
          return {
            release_date: {
              $gte: date_gte
            }
          };
        } else return {};
      };

      const convertFirstAirDate = (date_gte: string, data_lte: string) => {
        if (date_gte != '' && data_lte != '') {
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
        } else if (date_gte != '' && data_lte == '') {
          return {
            first_air_date: {
              $gte: date_gte
            }
          };
        } else return {};
      };

      const releaseDate = convertReleaseDate(
        primaryReleaseDateGte,
        primaryReleaseDateLte
      );

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
              const movie1 = await Movie.find({
                $or: [
                  { $and: [releaseDate, genres, originalLanguage] },
                  { $and: [firstAirDate, genres, originalLanguage] }
                ]
              })
                .skip(page * limit)
                .limit(limit)
                .sort({ views: -1 });

              result.results = movie1;
              break;
            case 'release_date_desc':
              const movie2 = await Movie.find({
                $or: [
                  { $and: [releaseDate, genres, originalLanguage] },
                  { $and: [firstAirDate, genres, originalLanguage] }
                ]
              })
                .skip(page * limit)
                .limit(limit)
                .sort({ release_date: -1 });

              result.results = movie2;
              break;
            case 'revenue_desc':
              const movie3 = await Movie.find({
                $or: [
                  { $and: [releaseDate, genres, originalLanguage] },
                  { $and: [firstAirDate, genres, originalLanguage] }
                ]
              })
                .skip(page * limit)
                .limit(limit)
                .sort({ revenue: -1 });

              result.results = movie3;
              break;
            case 'vote_average_desc':
              const movie4 = await Movie.find({
                $or: [
                  { $and: [releaseDate, genres, originalLanguage] },
                  { $and: [firstAirDate, genres, originalLanguage] }
                ]
              })
                .skip(page * limit)
                .limit(limit)
                .sort({ vote_average: -1 });

              result.results = movie4;
              break;
            case 'vote_count_desc':
              const movie5 = await Movie.find({
                $or: [
                  { $and: [releaseDate, genres, originalLanguage] },
                  { $and: [firstAirDate, genres, originalLanguage] }
                ]
              })
                .skip(page * limit)
                .limit(limit)
                .sort({ vote_count: -1 });

              result.results = movie5;
              break;
            case '':
              const movie = await Movie.find({
                $or: [
                  { $and: [releaseDate, genres, originalLanguage] },
                  { $and: [firstAirDate, genres, originalLanguage] }
                ]
              })
                .skip(page * limit)
                .limit(limit);

              result.results = movie;
              break;
            default:
              return next(
                createHttpError.NotFound(
                  `Discover with sort by: ${sortBy} is not found!`
                )
              );
          }

          result.total = await Movie.countDocuments({
            $or: [
              { $and: [releaseDate, genres, originalLanguage] },
              { $and: [firstAirDate, genres, originalLanguage] }
            ]
          });
          break;

        case 'movie':
          switch (sortBy) {
            case 'views_desc':
              result.results = await Movie.find({
                media_type: 'movie',
                $and: [releaseDate, genres, originalLanguage]
              })
                .skip(page * limit)
                .limit(limit)
                .sort({ views: -1 });
              break;
            case 'release_date_desc':
              result.results = await Movie.find({
                media_type: 'movie',
                $and: [releaseDate, genres, originalLanguage]
              })
                .skip(page * limit)
                .limit(limit)
                .sort({ release_date: -1 });
              break;
            case 'revenue_desc':
              result.results = await Movie.find({
                media_type: 'movie',
                $and: [releaseDate, genres, originalLanguage]
              })
                .skip(page * limit)
                .limit(limit)
                .sort({ revenue: -1 });
              break;
            case 'vote_average_desc':
              result.results = await Movie.find({
                media_type: 'movie',
                $and: [releaseDate, genres, originalLanguage]
              })
                .skip(page * limit)
                .limit(limit)
                .sort({ vote_average: -1 });
              break;
            case 'vote_count_desc':
              result.results = await Movie.find({
                media_type: 'movie',
                $and: [releaseDate, genres, originalLanguage]
              })
                .skip(page * limit)
                .limit(limit)
                .sort({ vote_count: -1 });
              break;
            case '':
              result.results = await Movie.find({
                media_type: 'movie',
                $and: [releaseDate, genres, originalLanguage]
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
          }

          result.total = await Movie.countDocuments({
            media_type: 'movie',
            $and: [releaseDate, genres, originalLanguage]
          });
          break;
        case 'tv':
          switch (sortBy) {
            case 'views_desc':
              result.results = await Movie.find({
                media_type: 'tv',
                $and: [firstAirDate, genres, originalLanguage]
              })
                .skip(page * limit)
                .limit(limit)
                .sort({ views: -1 });
              break;
            case 'release_date_desc':
              result.results = await Movie.find({
                media_type: 'tv',
                $and: [firstAirDate, genres, originalLanguage]
              })
                .skip(page * limit)
                .limit(limit)
                .sort({ first_air_date: -1 });
              break;
            case 'revenue_desc':
              result.results = await Movie.find({
                media_type: 'tv',
                $and: [firstAirDate, genres, originalLanguage]
              })
                .skip(page * limit)
                .limit(limit)
                .sort({ revenue: -1 });
              break;
            case 'vote_average_desc':
              result.results = await Movie.find({
                media_type: 'tv',
                $and: [firstAirDate, genres, originalLanguage]
              })
                .skip(page * limit)
                .limit(limit)
                .sort({ vote_average: -1 });
              break;
            case 'vote_count_desc':
              result.results = await Movie.find({
                media_type: 'tv',
                $and: [firstAirDate, genres, originalLanguage]
              })
                .skip(page * limit)
                .limit(limit)
                .sort({ vote_count: -1 });
              break;
            case '':
              result.results = await Movie.find({
                media_type: 'tv',
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
          }

          result.total = await Movie.countDocuments({
            media_type: 'tv',
            $and: [firstAirDate, genres, originalLanguage]
          });
          break;
        default:
          return next(
            createHttpError.NotFound(
              `Not found with slug: ${req.params.slug} !`
            )
          );
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

export default new DiscoverController();
