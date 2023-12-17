import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import { v4 as uuidv4 } from 'uuid';
import Rank from '@/models/rank';
import Movie from '@/models/movie';
import TV from '@/models/tv';
import RedisCache from '@/config/redis';

class RankController extends RedisCache {
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
        case 'day':
          const movie1 = await Movie.find()
            .skip(0 * (limit / 2))
            .limit(limit / 2)
            .sort({ views: -1 });

          const tv1 = await TV.find()
            .skip(0 * (limit / 2))
            .limit(limit / 2)
            .sort({ views: -1 });

          data = movie1.concat(tv1);

          total = await Movie.countDocuments({});
          break;
        case 'week':
          const movie2 = await Movie.find()
            .skip(1 * (limit / 2))
            .limit(limit / 2)
            .sort({ views: -1 });

          const tv2 = await TV.find()
            .skip(1 * (limit / 2))
            .limit(limit / 2)
            .sort({ views: -1 });

          data = movie2.concat(tv2);

          total = await Movie.countDocuments({});
          break;
        case 'month':
          const movie3 = await Movie.find()
            .skip(2 * (limit / 2))
            .limit(limit / 2)
            .sort({ views: -1 });

          const tv3 = await TV.find()
            .skip(2 * (limit / 2))
            .limit(limit / 2)
            .sort({ views: -1 });

          data = movie3.concat(tv3);

          total = await Movie.countDocuments({});
          break;
        case 'all':
          const movie4 = await Movie.find()
            .skip(3 * (limit / 2))
            .limit(limit / 2)
            .sort({ views: -1 });

          const tv4 = await TV.find()
            .skip(3 * (limit / 2))
            .limit(limit / 2)
            .sort({ views: -1 });

          data = movie4.concat(tv4);

          total = await Movie.countDocuments({});
          break;
        default:
          return next(
            createHttpError.NotFound(
              `Not found with slug: ${req.params.slug} !`
            )
          );
          break;
      }

      const response = {
        page: page + 1,
        results: data,
        page_size: limit,
      };

      await RedisCache.client.setEx(
        key,
        +process.env.REDIS_CACHE_TIME!,
        JSON.stringify(response)
      );

      return res.json(response);
    } catch (error) {
      next(error);
    } finally {
    }
  }

  async hotPlay(req: Request, res: Response, next: NextFunction) {
    try {
      const key: string = req.originalUrl;
      const dataCache: any = await RedisCache.client.get(key);

      const page: number = +req.query?.page! - 1 || 0;
      const limit: number = +req.query?.limit! || 10;

      if (dataCache != null) {
        return res.json(JSON.parse(dataCache));
      }

      const topRankPlay = await Rank.find({
        type: 'play',
      })
        .skip(page * limit)
        .limit(limit)
        .sort({ updated_at: -1 });

      const total = await Rank.countDocuments({
        type: 'play',
      });

      const result = {
        page: page,
        results: topRankPlay,
        page_size: limit,
        total: total,
      };

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

      const topRankSearch = await Rank.find({
        type: 'search',
      })
        .skip(page * limit)
        .limit(limit)
        .sort({ updated_at: -1 });

      const total = await Rank.countDocuments({
        type: 'search',
      });

      const result = {
        page: page,
        results: topRankSearch,
        page_size: limit,
        total: total,
      };

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
}

export default new RankController();
