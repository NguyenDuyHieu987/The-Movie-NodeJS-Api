import createHttpError from 'http-errors';
import Movie from '@/models/movie';
import TV from '@/models/tv';
import Search from '@/models/search';
import RedisCache from '@/config/redis';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import type { user } from '@/types';
import type { NextFunction, Request, Response } from 'express';

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

      // if (query.length == 0) {
      //   return res.json(result);
      // }

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

  async topSearch(req: Request, res: Response, next: NextFunction) {
    try {
      const key: string = req.originalUrl;
      const dataCache: any = await RedisCache.client.get(key);

      const page: number = +req.query?.page! - 1 || 0;
      const limit: number = +req.query?.limit! || 20;

      if (dataCache != null) {
        return res.json(JSON.parse(dataCache));
      }

      const topSearch = await Search.find({
        type: 'search',
      })
        .skip(page * limit)
        .limit(limit)
        .sort({ search_times: -1 });

      const total = await Search.countDocuments({
        type: 'search',
      });

      const result = {
        page: page,
        results: topSearch,
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
    }
  }

  async searchInTopSearch(req: Request, res: Response, next: NextFunction) {
    try {
      const query: string = (req.query.query as string) || '';
      const key: string = req.originalUrl;
      const dataCache: any = await RedisCache.client.get(key);

      const page: number = +req.query?.page! - 1 || 0;
      const limit: number = +req.query?.limit! || 10;

      if (dataCache != null) {
        return res.json(JSON.parse(dataCache));
      }

      const topSearch = await Search.find({
        type: 'search',
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { original_name: { $regex: query, $options: 'i' } },
        ],
      })
        .skip(page * limit)
        .limit(limit)
        .sort({ search_times: -1 });

      const total = await Search.countDocuments({
        type: 'search',
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { original_name: { $regex: query, $options: 'i' } },
        ],
      });

      const result = {
        page: page,
        results: topSearch,
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
    }
  }

  async searchHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const user_token =
        req.cookies.user_token ||
        req.headers.authorization!.replace('Bearer ', '');

      const user = jwt.verify(user_token, process.env.JWT_SIGNATURE_SECRET!, {
        algorithms: ['HS256'],
      }) as user;

      const page: number = +req.query?.page! - 1 || 0;
      const limit: number = +req.query?.limit! || 10;

      const searchHistory = await Search.find({
        user_id: user.id,
        type: 'history',
      })
        .skip(page * limit)
        .limit(limit)
        .sort({ updated_at: -1, search_times: -1 });

      const total = await Search.countDocuments({
        user_id: user.id,
        type: 'history',
      });

      return res.json({
        page: page,
        results: searchHistory,
        page_size: limit,
        total: total,
      });
    } catch (error) {
      next(error);
    }
  }

  async searchInHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const user_token =
        req.cookies.user_token ||
        req.headers.authorization!.replace('Bearer ', '');

      const user = jwt.verify(user_token, process.env.JWT_SIGNATURE_SECRET!, {
        algorithms: ['HS256'],
      }) as user;

      const query: string = (req.query.query as string) || '';
      const page: number = +req.query?.page! - 1 || 0;
      const limit: number = +req.query?.limit! || 10;

      const searchHistory = await Search.find({
        user_id: user.id,
        type: 'history',
        query: { $regex: query, $options: 'i' },
      })
        .skip(page * limit)
        .limit(limit)
        .sort({ updated_at: -1, search_times: -1 });

      const total = await Search.countDocuments({
        user_id: user.id,
        type: 'history',
        query: { $regex: query, $options: 'i' },
      });

      return res.json({
        page: page,
        results: searchHistory,
        page_size: limit,
        total: total,
      });
    } catch (error) {
      next(error);
    }
  }

  async addSearch(req: Request, res: Response, next: NextFunction) {
    try {
      const movieId: string = req.body.movieId;
      const movieType: string = req.body.movieType;
      const searchQuery: string = req.body.query;

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
        const itemSearch = await Search.findOne({
          movie_id: movieId,
          media_type: movieType,
          type: 'search',
          query: searchQuery,
        });

        if (itemSearch != null) {
          itemSearch.updated_at = new Date();
          itemSearch.search_times! += 1;

          await itemSearch.save();

          return res.json({
            updated: true,
            result: itemSearch,
          });
        } else {
          const idSearch: string = uuidv4();

          let resultInserted = null;

          if (movie.media_type == 'movie') {
            resultInserted = await Search.create({
              id: idSearch,
              type: 'search',
              query: searchQuery,
              search_times: 0,
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
            resultInserted = await Search.create({
              id: idSearch,
              type: 'search',
              query: searchQuery,
              search_times: 0,
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
              added: true,
              result: resultInserted,
            });
          } else {
            return res.json({
              success: false,
              result: 'Add search failed',
            });
          }
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
    }
  }

  async addHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const user_token =
        req.cookies.user_token ||
        req.headers.authorization!.replace('Bearer ', '');

      const user = jwt.verify(user_token, process.env.JWT_SIGNATURE_SECRET!, {
        algorithms: ['HS256'],
      }) as user;

      const searchQuery: string = req.body.query;

      const itemSearchHistory = await Search.findOne({
        user_id: user.id,
        type: 'history',
        query: searchQuery,
      });

      if (itemSearchHistory != null) {
        itemSearchHistory.updated_at = new Date();
        itemSearchHistory.search_times! += 1;

        await itemSearchHistory.save();

        return res.json({
          updated: true,
          result: itemSearchHistory,
        });
      } else {
        const idSearch: string = uuidv4();

        const resultInserted = await Search.create({
          id: idSearch,
          user_id: user.id,
          type: 'history',
          query: searchQuery,
          search_times: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (resultInserted != null) {
          return res.json({
            added: true,
            result: resultInserted,
          });
        } else {
          return res.json({
            success: false,
            result: 'Add search history failed',
          });
        }
      }
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.json({ isTokenExpired: true, result: 'Token is expired' });
      }

      if (error instanceof jwt.JsonWebTokenError) {
        return res.json({ isInvalidToken: true, result: 'Token is invalid' });
      }

      next(error);
    }
  }

  async removeHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const user_token =
        req.cookies.user_token ||
        req.headers.authorization!.replace('Bearer ', '');

      const user = jwt.verify(user_token, process.env.JWT_SIGNATURE_SECRET!, {
        algorithms: ['HS256'],
      }) as user;

      const id: string = req.body.id;

      const itemSearchHistory = await Search.findOne({
        id: id,
        user_id: user.id,
        type: 'history',
      });

      if (itemSearchHistory != null) {
        const resultDeleted = await Search.deleteOne({
          id: id,
          user_id: user.id,
          type: 'history',
        });

        if (resultDeleted.deletedCount == 1) {
          return res.json({
            success: true,
            result: 'Delete search history successfully',
          });
        } else {
          return res.json({
            success: false,
            result: 'Delete search history failed',
          });
        }
      } else {
        return next(
          createHttpError.NotFound(`Search history with id: ${id} is not found`)
        );
      }
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.json({ isTokenExpired: true, result: 'Token is expired' });
      }

      if (error instanceof jwt.JsonWebTokenError) {
        return res.json({ isInvalidToken: true, result: 'Token is invalid' });
      }

      next(error);
    }
  }

  async clearHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const user_token =
        req.cookies.user_token ||
        req.headers.authorization!.replace('Bearer ', '');

      const user = jwt.verify(user_token, process.env.JWT_SIGNATURE_SECRET!, {
        algorithms: ['HS256'],
      }) as user;

      const resultCleared = await Search.deleteMany({
        user_id: user.id,
        type: 'history',
      });

      if (resultCleared.deletedCount >= 1) {
        return res.json({
          success: true,
          result: 'Clear search history successfully',
        });
      } else {
        return res.json({
          success: false,
          result: 'Clear search history failed',
        });
      }
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.json({ isTokenExpired: true, result: 'Token is expired' });
      }

      if (error instanceof jwt.JsonWebTokenError) {
        return res.json({ isInvalidToken: true, result: 'Token is invalid' });
      }

      next(error);
    }
  }
}

export default new SearchController();
