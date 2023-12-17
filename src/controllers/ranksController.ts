import createHttpError from 'http-errors';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import Rank from '@/models/rank';
import Movie from '@/models/movie';
import TV from '@/models/tv';
import RedisCache from '@/config/redis';
import type { user } from '@/types';
import type { NextFunction, Request, Response } from 'express';

class RankController extends RedisCache {
  async hotPlay(req: Request, res: Response, next: NextFunction) {
    try {
      const key: string = req.originalUrl;
      const dataCache: any = await RedisCache.client.get(key);

      const page: number = +req.query?.page! - 1 || 0;
      const limit: number = +req.query?.limit! || 10;

      if (dataCache != null) {
        return res.json(JSON.parse(dataCache));
      }

      let result = {
        page: page,
        results: [],
        page_size: limit,
      };

      let dateStart = new Date();
      let dateEnd = new Date();

      dateStart.setUTCHours(0, 0, 0, 0);
      dateEnd.setUTCHours(23, 59, 59, 999);

      switch (req.params.type) {
        case 'day':
          dateStart.setUTCHours(0, 0, 0, 0);
          dateEnd.setUTCHours(23, 59, 59, 999);

          result.results = await Rank.aggregate([
            {
              $match: {
                type: 'play',
                created_at: { $gte: dateStart, $lte: dateEnd },
              },
            },
            {
              $group: {
                _id: '$movie_id',
                id: { $first: '$id' },
                movie_id: { $first: '$movie_id' },
                media_type: { $first: '$media_type' },
                name: { $first: '$name' },
                original_name: { $first: '$original_name' },
                count: { $sum: 1 },
              },
            },
            { $skip: page * limit },
            { $limit: limit },
            {
              $sort: {
                count: -1,
              },
            },
          ]);

          break;
        case 'week':
          const startWeek: number =
            dateStart.getDate() -
            (dateStart.getDay() == 0 ? 7 : dateStart.getDay());

          dateStart.setUTCDate(startWeek + 1);

          dateEnd.setUTCDate(startWeek + 7);

          result.results = await Rank.aggregate([
            {
              $match: {
                type: 'play',
                created_at: { $gte: dateStart, $lte: dateEnd },
              },
            },
            {
              $group: {
                _id: '$movie_id',
                id: { $first: '$id' },
                movie_id: { $first: '$movie_id' },
                media_type: { $first: '$media_type' },
                name: { $first: '$name' },
                original_name: { $first: '$original_name' },
                count: { $sum: 1 },
              },
            },
            { $skip: page * limit },
            { $limit: limit },
            {
              $sort: {
                count: -1,
              },
            },
          ]);

          break;
        case 'month':
          dateStart.setUTCDate(1);
          dateEnd.setUTCDate(1);
          dateEnd.setUTCHours(0, 0, 0, 0);

          dateEnd.setUTCMonth(dateStart.getMonth() + 1);

          result.results = await Rank.aggregate([
            {
              $match: {
                type: 'play',
                created_at: { $gte: dateStart, $lte: dateEnd },
              },
            },
            {
              $group: {
                _id: '$movie_id',
                id: { $first: '$id' },
                movie_id: { $first: '$movie_id' },
                media_type: { $first: '$media_type' },
                name: { $first: '$name' },
                original_name: { $first: '$original_name' },
                count: { $sum: 1 },
              },
            },
            { $skip: page * limit },
            { $limit: limit },
            {
              $sort: {
                count: -1,
              },
            },
          ]);

          break;
        case 'year':
          dateStart.setUTCDate(1);
          dateStart.setUTCMonth(0);
          dateEnd.setUTCDate(1);
          dateEnd.setUTCHours(0, 0, 0, 0);

          dateEnd.setUTCFullYear(dateStart.getFullYear() + 1);

          result.results = await Rank.aggregate([
            {
              $match: {
                type: 'play',
                created_at: { $gte: dateStart, $lte: dateEnd },
              },
            },
            {
              $group: {
                _id: '$movie_id',
                id: { $first: '$id' },
                movie_id: { $first: '$movie_id' },
                media_type: { $first: '$media_type' },
                name: { $first: '$name' },
                original_name: { $first: '$original_name' },
                count: { $sum: 1 },
              },
            },
            { $skip: page * limit },
            { $limit: limit },
            {
              $sort: {
                count: -1,
              },
            },
          ]);
          break;
        case 'all':
          result.results = await Rank.aggregate([
            {
              $match: {
                type: 'play',
              },
            },
            {
              $group: {
                _id: '$movie_id',
                id: { $first: '$id' },
                movie_id: { $first: '$movie_id' },
                media_type: { $first: '$media_type' },
                name: { $first: '$name' },
                original_name: { $first: '$original_name' },
                count: { $sum: 1 },
              },
            },
            { $skip: page * limit },
            { $limit: limit },
            {
              $sort: {
                count: -1,
              },
            },
          ]);
          break;
        default:
          return next(
            createHttpError.NotFound(
              `Rank with type: ${req.params.slug} is not found !`
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
    } finally {
    }
  }

  async hotSearch(req: Request, res: Response, next: NextFunction) {
    try {
      const key: string = req.originalUrl;
      const dataCache: any = await RedisCache.client.get(key);

      const page: number = +req.query?.page! - 1 || 0;
      const limit: number = +req.query?.limit! || 10;

      if (dataCache != null) {
        return res.json(JSON.parse(dataCache));
      }

      let result = {
        page: page,
        results: [],
        page_size: limit,
      };

      let dateStart = new Date();
      let dateEnd = new Date();

      dateStart.setUTCHours(0, 0, 0, 0);
      dateEnd.setUTCHours(23, 59, 59, 999);

      switch (req.params.type) {
        case 'day':
          dateStart.setUTCHours(0, 0, 0, 0);
          dateEnd.setUTCHours(23, 59, 59, 999);

          result.results = await Rank.aggregate([
            {
              $match: {
                type: 'search',
                created_at: { $gte: dateStart, $lte: dateEnd },
              },
            },
            {
              $group: {
                _id: '$movie_id',
                id: { $first: '$id' },
                movie_id: { $first: '$movie_id' },
                media_type: { $first: '$media_type' },
                name: { $first: '$name' },
                original_name: { $first: '$original_name' },
                count: { $sum: 1 },
              },
            },
            { $skip: page * limit },
            { $limit: limit },
            {
              $sort: {
                count: -1,
              },
            },
          ]);

          break;
        case 'week':
          const startWeek: number =
            dateStart.getDate() -
            (dateStart.getDay() == 0 ? 7 : dateStart.getDay());

          dateStart.setUTCDate(startWeek + 1);

          dateEnd.setUTCDate(startWeek + 7);

          result.results = await Rank.aggregate([
            {
              $match: {
                type: 'search',
                created_at: { $gte: dateStart, $lte: dateEnd },
              },
            },
            {
              $group: {
                _id: '$movie_id',
                id: { $first: '$id' },
                movie_id: { $first: '$movie_id' },
                media_type: { $first: '$media_type' },
                name: { $first: '$name' },
                original_name: { $first: '$original_name' },
                count: { $sum: 1 },
              },
            },
            { $skip: page * limit },
            { $limit: limit },
            {
              $sort: {
                count: -1,
              },
            },
          ]);

          break;
        case 'month':
          dateStart.setUTCDate(1);
          dateEnd.setUTCDate(1);
          dateEnd.setUTCHours(0, 0, 0, 0);

          dateEnd.setUTCMonth(dateStart.getMonth() + 1);

          result.results = await Rank.aggregate([
            {
              $match: {
                type: 'search',
                created_at: { $gte: dateStart, $lte: dateEnd },
              },
            },
            {
              $group: {
                _id: '$movie_id',
                id: { $first: '$id' },
                movie_id: { $first: '$movie_id' },
                media_type: { $first: '$media_type' },
                name: { $first: '$name' },
                original_name: { $first: '$original_name' },
                count: { $sum: 1 },
              },
            },
            { $skip: page * limit },
            { $limit: limit },
            {
              $sort: {
                count: -1,
              },
            },
          ]);

          break;
        case 'year':
          dateStart.setUTCDate(1);
          dateStart.setUTCMonth(0);
          dateEnd.setUTCDate(1);
          dateEnd.setUTCHours(0, 0, 0, 0);

          dateEnd.setUTCFullYear(dateStart.getFullYear() + 1);

          result.results = await Rank.aggregate([
            {
              $match: {
                type: 'search',
                created_at: { $gte: dateStart, $lte: dateEnd },
              },
            },
            {
              $group: {
                _id: '$movie_id',
                id: { $first: '$id' },
                movie_id: { $first: '$movie_id' },
                media_type: { $first: '$media_type' },
                name: { $first: '$name' },
                original_name: { $first: '$original_name' },
                count: { $sum: 1 },
              },
            },
            { $skip: page * limit },
            { $limit: limit },
            {
              $sort: {
                count: -1,
              },
            },
          ]);
          break;
        case 'all':
          result.results = await Rank.aggregate([
            {
              $match: {
                type: 'search',
              },
            },
            {
              $group: {
                _id: '$movie_id',
                id: { $first: '$id' },
                movie_id: { $first: '$movie_id' },
                media_type: { $first: '$media_type' },
                name: { $first: '$name' },
                original_name: { $first: '$original_name' },
                count: { $sum: 1 },
              },
            },
            { $skip: page * limit },
            { $limit: limit },
            {
              $sort: {
                count: -1,
              },
            },
          ]);
          break;
        default:
          return next(
            createHttpError.NotFound(
              `Rank with type: ${req.params.slug} is not found !`
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
    } finally {
    }
  }

  async highRate(req: Request, res: Response, next: NextFunction) {
    try {
      const key: string = req.originalUrl;
      const dataCache: any = await RedisCache.client.get(key);

      const page: number = +req.query?.page! - 1 || 0;
      const limit: number = +req.query?.limit! || 10;

      if (dataCache != null) {
        return res.json(JSON.parse(dataCache));
      }

      let result = {
        page: page,
        results: [],
        page_size: limit,
      };

      let dateStart = new Date();
      let dateEnd = new Date();

      dateStart.setUTCHours(0, 0, 0, 0);
      dateEnd.setUTCHours(23, 59, 59, 999);

      switch (req.params.type) {
        case 'day':
          dateStart.setUTCHours(0, 0, 0, 0);
          dateEnd.setUTCHours(23, 59, 59, 999);

          result.results = await Rank.aggregate([
            {
              $match: {
                type: 'rate',
                created_at: { $gte: dateStart, $lte: dateEnd },
              },
            },
            {
              $group: {
                _id: '$movie_id',
                id: { $first: '$id' },
                movie_id: { $first: '$movie_id' },
                media_type: { $first: '$media_type' },
                name: { $first: '$name' },
                original_name: { $first: '$original_name' },
                rate_average: { $avg: '$rate_value' },
              },
            },
            { $skip: page * limit },
            { $limit: limit },
            {
              $sort: {
                rate_average: -1,
              },
            },
          ]);

          break;
        case 'week':
          const startWeek: number =
            dateStart.getDate() -
            (dateStart.getDay() == 0 ? 7 : dateStart.getDay());

          dateStart.setUTCDate(startWeek + 1);

          dateEnd.setUTCDate(startWeek + 7);

          result.results = await Rank.aggregate([
            {
              $match: {
                type: 'rate',
                created_at: { $gte: dateStart, $lte: dateEnd },
              },
            },
            {
              $group: {
                _id: '$movie_id',
                id: { $first: '$id' },
                movie_id: { $first: '$movie_id' },
                media_type: { $first: '$media_type' },
                name: { $first: '$name' },
                original_name: { $first: '$original_name' },
                rate_average: { $avg: '$rate_value' },
              },
            },
            { $skip: page * limit },
            { $limit: limit },
            {
              $sort: {
                rate_average: -1,
              },
            },
          ]);

          break;
        case 'month':
          dateStart.setUTCDate(1);
          dateEnd.setUTCDate(1);
          dateEnd.setUTCHours(0, 0, 0, 0);

          dateEnd.setUTCMonth(dateStart.getMonth() + 1);

          result.results = await Rank.aggregate([
            {
              $match: {
                type: 'rate',
                created_at: { $gte: dateStart, $lte: dateEnd },
              },
            },
            {
              $group: {
                _id: '$movie_id',
                id: { $first: '$id' },
                movie_id: { $first: '$movie_id' },
                media_type: { $first: '$media_type' },
                name: { $first: '$name' },
                original_name: { $first: '$original_name' },
                rate_average: { $avg: '$rate_value' },
              },
            },
            { $skip: page * limit },
            { $limit: limit },
            {
              $sort: {
                rate_average: -1,
              },
            },
          ]);

          break;
        case 'year':
          dateStart.setUTCDate(1);
          dateStart.setUTCMonth(0);
          dateEnd.setUTCDate(1);
          dateEnd.setUTCHours(0, 0, 0, 0);

          dateEnd.setUTCFullYear(dateStart.getFullYear() + 1);

          result.results = await Rank.aggregate([
            {
              $match: {
                type: 'rate',
                created_at: { $gte: dateStart, $lte: dateEnd },
              },
            },
            {
              $group: {
                _id: '$movie_id',
                id: { $first: '$id' },
                movie_id: { $first: '$movie_id' },
                media_type: { $first: '$media_type' },
                name: { $first: '$name' },
                original_name: { $first: '$original_name' },
                rate_average: { $avg: '$rate_value' },
              },
            },
            { $skip: page * limit },
            { $limit: limit },
            {
              $sort: {
                rate_average: -1,
              },
            },
          ]);
          break;
        case 'all':
          result.results = await Rank.aggregate([
            {
              $match: {
                type: 'rate',
              },
            },
            {
              $group: {
                _id: '$movie_id',
                id: { $first: '$id' },
                movie_id: { $first: '$movie_id' },
                media_type: { $first: '$media_type' },
                name: { $first: '$name' },
                original_name: { $first: '$original_name' },
                rate_average: { $avg: '$rate_value' },
              },
            },
            { $skip: page * limit },
            { $limit: limit },
            {
              $sort: {
                rate_average: -1,
              },
            },
          ]);
          break;
        default:
          return next(
            createHttpError.NotFound(
              `Rank with type: ${req.params.slug} is not found !`
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
    } finally {
    }
  }

  async addPlay(req: Request, res: Response, next: NextFunction) {
    try {
      const movieId: string = req.body.movie_id;
      const movieType: string = req.body.media_type;

      let movie: any = null;

      switch (movieType) {
        case 'movie':
          movie = await Movie.findOne({ id: movieId });
          break;
        case 'tv':
          movie = await TV.findOne({ id: movieId });
          break;
        default:
          return next(
            createHttpError.NotFound(
              `Movie with type: ${movieType} is not found`
            )
          );
          break;
      }

      if (movie != null) {
        const idRank: string = uuidv4();

        let resultInserted = null;

        if (movie.media_type == 'movie') {
          resultInserted = await Rank.create({
            id: idRank,
            type: 'play',
            movie_id: movie.id,
            media_type: movie.media_type,
            adult: movie.adult,
            backdrop_path: movie.backdrop_path,
            release_date: movie?.release_date,
            name: movie.name,
            original_name: movie.original_name,
            overview: movie.overview,
            poster_path: movie.poster_path,
            genres: movie.genres,
            runtime: movie.runtime,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        } else if (movie.media_type == 'tv') {
          resultInserted = await Rank.create({
            id: idRank,
            type: 'play',
            movie_id: movie.id,
            media_type: movie.media_type,
            adult: movie.adult,
            backdrop_path: movie.backdrop_path,
            first_air_date: movie?.first_air_date,
            last_air_date: movie?.last_air_date,
            name: movie.name,
            original_name: movie.original_name,
            overview: movie.overview,
            poster_path: movie.poster_path,
            genres: movie.genres,
            episode_run_time: movie.episode_run_time,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }

        if (resultInserted != null) {
          return res.json({
            success: true,
            result: 'Add rank play successfully',
          });
        } else {
          return res.json({
            success: false,
            result: 'Add rank play failed',
          });
        }
      } else {
        return next(createHttpError.NotFound('Movie is not exists'));
      }
    } catch (error) {
      next(error);
    } finally {
    }
  }

  async addSearch(req: Request, res: Response, next: NextFunction) {
    try {
      const movieId: string = req.body.movie_id;
      const movieType: string = req.body.media_type;
      const searchQuery: string = req.body.query;

      if (movieId && movieType) {
        let movie: any = null;

        switch (movieType) {
          case 'movie':
            movie = await Movie.findOne({ id: movieId });
            break;
          case 'tv':
            movie = await TV.findOne({ id: movieId });
            break;
          default:
            return next(
              createHttpError.NotFound(
                `Movie with type: ${movieType} is not found`
              )
            );
            break;
        }

        if (movie != null) {
          const idRank: string = uuidv4();

          let resultInserted = null;

          if (movie.media_type == 'movie') {
            resultInserted = await Rank.create({
              id: idRank,
              type: 'search',
              query: movie.name,
              movie_id: movie.id,
              media_type: movie.media_type,
              adult: movie.adult,
              backdrop_path: movie.backdrop_path,
              release_date: movie?.release_date,
              name: movie.name,
              original_name: movie.original_name,
              overview: movie.overview,
              poster_path: movie.poster_path,
              genres: movie.genres,
              runtime: movie.runtime,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          } else if (movie.media_type == 'tv') {
            resultInserted = await Rank.create({
              id: idRank,
              type: 'search',
              query: movie.name,
              movie_id: movie.id,
              media_type: movie.media_type,
              adult: movie.adult,
              backdrop_path: movie.backdrop_path,
              first_air_date: movie?.first_air_date,
              last_air_date: movie?.last_air_date,
              name: movie.name,
              original_name: movie.original_name,
              overview: movie.overview,
              poster_path: movie.poster_path,
              genres: movie.genres,
              episode_run_time: movie.episode_run_time,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }

          if (resultInserted != null) {
            return res.json({
              success: true,
              result: 'Add rank search successfully',
            });
          } else {
            return res.json({
              success: false,
              result: 'Add rank search failed',
            });
          }
        } else {
          return next(createHttpError.NotFound('Movie is not exists'));
        }
      } else {
        let movie1: any = null;

        movie1 = await Movie.findOne({
          $or: [
            { name: { $regex: searchQuery, $options: 'i' } },
            { original_name: { $regex: searchQuery, $options: 'i' } },
          ],
        })
          .skip(0)
          .limit(1)
          .sort({ views: -1 });

        if (movie1 == null) {
          movie1 = await TV.findOne({
            $or: [
              { name: { $regex: searchQuery, $options: 'i' } },
              { original_name: { $regex: searchQuery, $options: 'i' } },
            ],
          })
            .skip(0)
            .limit(1)
            .sort({ views: -1 });
        }

        if (movie1 != null) {
          const idSearch: string = uuidv4();

          let resultInserted = null;

          if (movie1.media_type == 'movie') {
            resultInserted = await Rank.create({
              id: idSearch,
              type: 'search',
              query: movie1.name,
              movie_id: movie1.id,
              media_type: movie1.media_type,
              adult: movie1.adult,
              backdrop_path: movie1.backdrop_path,
              release_date: movie1?.release_date,
              name: movie1.name,
              original_name: movie1.original_name,
              overview: movie1.overview,
              poster_path: movie1.poster_path,
              genres: movie1.genres,
              runtime: movie1.runtime,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          } else if (movie1.media_type == 'tv') {
            resultInserted = await Rank.create({
              id: idSearch,
              type: 'search',
              query: movie1.name,
              movie_id: movie1.id,
              media_type: movie1.media_type,
              adult: movie1.adult,
              backdrop_path: movie1.backdrop_path,
              first_air_date: movie1?.first_air_date,
              last_air_date: movie1?.last_air_date,
              name: movie1.name,
              original_name: movie1.original_name,
              overview: movie1.overview,
              poster_path: movie1.poster_path,
              genres: movie1.genres,
              episode_run_time: movie1.episode_run_time,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }

          if (resultInserted != null) {
            return res.json({
              success: true,
              result: 'Add rank search successfully',
            });
          } else {
            return res.json({
              success: false,
              result: 'Add rank search failed',
            });
          }
        }
      }
    } catch (error) {
      next(error);
    } finally {
    }
  }

  async addRate(req: Request, res: Response, next: NextFunction) {
    try {
      const user_token =
        req.cookies.user_token ||
        req.headers.authorization!.replace('Bearer ', '');

      const user = jwt.verify(user_token, process.env.JWT_SIGNATURE_SECRET!, {
        algorithms: ['HS256'],
      }) as user;

      const movieId: string = req.body.movie_id;
      const movieType: string = req.body.media_type;
      const rateValue: number = req.body.rate_value;

      let movie: any = null;

      switch (movieType) {
        case 'movie':
          movie = await Movie.findOne({ id: movieId });
          break;
        case 'tv':
          movie = await TV.findOne({ id: movieId });
          break;
        default:
          return next(
            createHttpError.NotFound(
              `Movie with type: ${movieType} is not found`
            )
          );
          break;
      }

      if (movie != null) {
        const idRank: string = uuidv4();

        let resultInserted = null;

        if (movie.media_type == 'movie') {
          resultInserted = await Rank.create({
            id: idRank,
            type: 'rate',
            rate_value: rateValue,
            user_id: user.id,
            movie_id: movie.id,
            media_type: movie.media_type,
            adult: movie.adult,
            backdrop_path: movie.backdrop_path,
            release_date: movie?.release_date,
            name: movie.name,
            original_name: movie.original_name,
            overview: movie.overview,
            poster_path: movie.poster_path,
            genres: movie.genres,
            runtime: movie.runtime,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        } else if (movie.media_type == 'tv') {
          resultInserted = await Rank.create({
            id: idRank,
            type: 'rate',
            rate_value: rateValue,
            user_id: user.id,
            movie_id: movie.id,
            media_type: movie.media_type,
            adult: movie.adult,
            backdrop_path: movie.backdrop_path,
            first_air_date: movie?.first_air_date,
            last_air_date: movie?.last_air_date,
            name: movie.name,
            original_name: movie.original_name,
            overview: movie.overview,
            poster_path: movie.poster_path,
            genres: movie.genres,
            episode_run_time: movie.episode_run_time,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }

        if (resultInserted != null) {
          return res.json({
            success: true,
            result: 'Add rank play successfully',
          });
        } else {
          return res.json({
            success: false,
            result: 'Add rank play failed',
          });
        }
      } else {
        return next(createHttpError.NotFound('Movie is not exists'));
      }
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.json({ isTokenExpired: true, result: 'Token is expired' });
      }

      if (error instanceof jwt.JsonWebTokenError) {
        return res.json({ isInvalidToken: true, result: 'Token is invalid' });
      }

      next(error);
    } finally {
    }
  }
}

export default new RankController();
