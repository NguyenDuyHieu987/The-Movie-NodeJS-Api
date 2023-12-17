import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import MovieSlug from '@/models/movieSlug';
import Movie from '@/models/movie';
import RedisCache from '@/config/redis';

class MovieSlugController extends RedisCache {
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
        case 'all':
          data = await Movie.find()
            .skip(page * limit)
            .limit(limit);

          total = await Movie.countDocuments({});

          break;
        case 'nowplaying':
          data = await MovieSlug.NowPlaying.find()
            .skip(page * limit)
            .limit(limit);

          total = await MovieSlug.NowPlaying.countDocuments({});

          break;
        case 'upcoming':
          data = await MovieSlug.UpComing.find()
            .skip(page * limit)
            .limit(limit);

          total = await MovieSlug.UpComing.countDocuments({});

          break;
        case 'popular':
          data = await MovieSlug.Popular.find()
            .skip(page * limit)
            .limit(limit);

          total = await MovieSlug.Popular.countDocuments({});

          break;
        case 'toprated':
          data = await MovieSlug.TopRated.find()
            .skip(page * limit)
            .limit(limit);

          total = await MovieSlug.TopRated.countDocuments({});

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

      return res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async filter(req: Request, res: Response, next: NextFunction) {
    try {
      const page: number = +req.query?.page! - 1 || 0;
      const limit: number = +req.query?.limit! || 20;
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
        if (date_gte != '') {
          return {
            release_date: {
              $gte: date_gte,
              $lte: data_lte,
            },
          };
        } else if (date_gte == '' && data_lte != '') {
          return {
            release_date: {
              $lte: data_lte,
            },
          };
        } else return {};
      };

      const releaseDate = convertReleaseDate(
        primaryReleaseDateGte,
        primaryReleaseDateLte
      );

      const convertGenres = (genre: string) => {
        if (genre != '') {
          return {
            genres: {
              $elemMatch: {
                id: +withGenres,
              },
            },
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

      let result: {
        page: number;
        results: any[];
        page_size: number;
        total: number;
      } = {
        page: page + 1,
        results: [],
        page_size: limit,
        total: 0,
      };

      switch (req.params.slug) {
        case 'all':
          switch (sortBy) {
            case 'views_desc':
              result.results = await Movie.find({
                $and: [releaseDate, genres, originalLanguage],
              })
                .skip(page * limit)
                .limit(limit)
                .sort({ views: -1 });
              break;
            case 'release_date_desc':
              result.results = await Movie.find({
                $and: [releaseDate, genres, originalLanguage],
              })
                .skip(page * limit)
                .limit(limit)
                .sort({ release_date: -1 });
              break;
            case 'revenue_desc':
              result.results = await Movie.find({
                $and: [releaseDate, genres, originalLanguage],
              })
                .skip(page * limit)
                .limit(limit)
                .sort({ revenue: -1 });
              break;
            case 'vote_average_desc':
              result.results = await Movie.find({
                $and: [releaseDate, genres, originalLanguage],
              })
                .skip(page * limit)
                .limit(limit)
                .sort({ vote_average: -1 });
              break;
            case 'vote_count_desc':
              result.results = await Movie.find({
                $and: [releaseDate, genres, originalLanguage],
              })
                .skip(page * limit)
                .limit(limit)
                .sort({ vote_count: -1 });
              break;
            case '':
              result.results = await Movie.find({
                $and: [releaseDate, genres, originalLanguage],
              })
                .skip(page * limit)
                .limit(limit);
              break;
            default:
              return next(
                createHttpError.NotFound(
                  `Discover movie with sort by: ${sortBy} is not found!`
                )
              );
              break;
          }

          result.total = await Movie.countDocuments({
            $and: [releaseDate, genres, originalLanguage],
          });
          break;
        case 'nowplaying':
          result.results = await MovieSlug.NowPlaying.find({
            $and: [releaseDate, genres, originalLanguage],
          })
            .skip(page * limit)
            .limit(limit);

          result.total = await MovieSlug.NowPlaying.countDocuments({
            $and: [releaseDate, genres, originalLanguage],
          });
          break;
        case 'upcoming':
          result.results = await MovieSlug.UpComing.find({
            $and: [releaseDate, genres, originalLanguage],
          })
            .skip(page * limit)
            .limit(limit);

          result.total = await MovieSlug.UpComing.countDocuments({
            $and: [releaseDate, genres, originalLanguage],
          });
          break;
        case 'popular':
          result.results = await MovieSlug.Popular.find({
            $and: [releaseDate, genres, originalLanguage],
          })
            .skip(page * limit)
            .limit(limit);

          result.total = await MovieSlug.Popular.countDocuments({
            $and: [releaseDate, genres, originalLanguage],
          });
          break;
        case 'toprated':
          result.results = await MovieSlug.TopRated.find({
            $and: [releaseDate, genres, originalLanguage],
          })
            .skip(page * limit)
            .limit(limit);

          result.total = await MovieSlug.TopRated.countDocuments({
            $and: [releaseDate, genres, originalLanguage],
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
      next(error);
    }
  }
}

export default new MovieSlugController();
