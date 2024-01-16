import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

import History from '@/models/history';
import Movie from '@/models/movie';
import TV from '@/models/tv';
import type { User } from '@/types';

class HistoryController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const userToken = res.locals.userToken;
      const user = res.locals.user as User;

      const skip: number = +req.query.skip! - 1 || 0;
      const limit: number = +req.query.limit! || 20;

      const result: {
        skip: number;
        results: any[];
        limit: number;
        total: number;
      } = {
        skip: skip + 1,
        results: [],
        limit,
        total: 0
      };

      switch (req.params.slug) {
        case 'all':
          result.results = await History.find({
            user_id: user.id
          })
            .skip(skip * limit)
            .limit(limit)
            .sort({ created_at: -1 });

          result.total = await History.countDocuments({
            user_id: user.id
          });
          break;
        case 'movie':
          result.results = await History.find({
            user_id: user.id,
            media_type: 'movie'
          })
            .skip(skip * limit)
            .limit(limit)
            .sort({ created_at: -1 });

          result.total = await History.countDocuments({
            user_id: user.id,
            media_type: 'movie'
          });
          break;
        case 'tv':
          result.results = await History.find({
            user_id: user.id,
            media_type: 'tv'
          })
            .skip(skip * limit)
            .limit(limit)
            .sort({ created_at: -1 });

          result.total = await History.countDocuments({
            user_id: user.id,
            media_type: 'tv'
          });
          break;
        default:
          return next(
            createHttpError.NotFound(
              `History with slug: ${req.params.slug} is not found!`
            )
          );
      }

      return res.json(result);
    } catch (error) {
      return next(error);
    }
  }

  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const userToken = res.locals.userToken;
      const user = res.locals.user as User;

      const query = req.query?.query || '';
      const skip: number = +req.query.skip! - 1 || 0;
      const limit: number = +req.query.limit! || 20;

      const result: {
        skip: number;
        results: any[];
        limit: number;
        total: number;
      } = {
        skip: skip + 1,
        results: [],
        limit,
        total: 0
      };

      switch (req.params.slug) {
        case 'all':
          result.results = await History.find({
            user_id: user.id,
            $or: [
              { name: { $regex: query, $options: 'i' } },
              { original_name: { $regex: query, $options: 'i' } }
            ]
          })
            .skip(skip * limit)
            .limit(limit)
            .sort({ created_at: -1 });

          result.total = await Movie.countDocuments({
            user_id: user.id,
            $or: [
              { name: { $regex: query, $options: 'i' } },
              { original_name: { $regex: query, $options: 'i' } }
            ]
          });
          break;
        case 'movie':
          result.results = await History.find({
            user_id: user.id,
            media_type: 'movie',
            $or: [
              { name: { $regex: query, $options: 'i' } },
              { original_name: { $regex: query, $options: 'i' } }
            ]
          })
            .skip(skip * limit)
            .limit(limit)
            .sort({ created_at: -1 });

          result.total = await Movie.countDocuments({
            user_id: user.id,
            media_type: 'movie',
            $or: [
              { name: { $regex: query, $options: 'i' } },
              { original_name: { $regex: query, $options: 'i' } }
            ]
          });
          break;
        case 'tv':
          result.results = await History.find({
            user_id: user.id,
            media_type: 'tv',
            $or: [
              { name: { $regex: query, $options: 'i' } },
              { original_name: { $regex: query, $options: 'i' } }
            ]
          })
            .skip(skip * limit)
            .limit(limit)
            .sort({ created_at: -1 });

          result.total = await Movie.countDocuments({
            user_id: user.id,
            media_type: 'tv',
            $or: [
              { name: { $regex: query, $options: 'i' } },
              { original_name: { $regex: query, $options: 'i' } }
            ]
          });
          break;
        default:
          return next(
            createHttpError.NotFound(
              `History with slug: ${req.params.slug} is not found!`
            )
          );
      }

      return res.json(result);
    } catch (error) {
      return next(error);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const userToken = res.locals.userToken;
      const user = res.locals.user as User;

      const data = await History.findOne({
        user_id: user.id,
        movie_id: req.params.movieId,
        media_type: req.params.type
      });

      if (data != null) {
        return res.json({
          success: true,
          result: {
            duration: data.duration,
            percent: data.percent,
            seconds: data.seconds
          }
        });
      } else {
        return res.json({
          success: false,
          result: 'This movie is not found in your history'
        });
      }
    } catch (error) {
      return next(error);
    }
  }

  async add(req: Request, res: Response, next: NextFunction) {
    try {
      const userToken = res.locals.userToken;
      const user = res.locals.user as User;

      const movieId: string = req.body.movie_id;
      const mediaType: string = req.body.media_type;
      const idItemHistory: string = uuidv4();
      const duration: number = Number(req.body.duration);
      const percent: number = Number(req.body.percent);
      const seconds: number = Number(req.body.seconds);

      switch (mediaType) {
        case 'movie':
          const movie = await Movie.findOne({ id: movieId });

          if (movie == null) {
            throw createHttpError.NotFound('Movie is not exists');
          }

          const itemHistory = await History.findOne({
            user_id: user.id,
            movie_id: movieId,
            media_type: 'movie'
          });

          if (itemHistory == null) {
            await History.create({
              id: idItemHistory,
              user_id: user.id,
              movie_id: movieId,
              name: movie.name,
              original_name: movie.original_name,
              original_language: movie.original_language,
              media_type: 'movie',
              genres: movie.genres,
              backdrop_path: movie.backdrop_path,
              poster_path: movie.poster_path,
              dominant_backdrop_color: movie.dominant_backdrop_color,
              dominant_poster_color: movie.dominant_poster_color,
              duration,
              percent,
              seconds,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

            return res.json({
              success: true,
              results: 'Add item to history suucessfully'
            });
          } else {
            const oldDuration: number = itemHistory.duration!;
            const oldSeconds: number = itemHistory.seconds!;
            const oldPercent: number = itemHistory.percent!;

            if (seconds > oldSeconds && percent > oldPercent) {
              // await History.updateOne(
              //   {
              //     user_id: user.id,
              //     movie_id: movieId,
              //     media_type: 'movie',
              //   },
              //   {
              //     $set: {
              //       percent: percent,
              //       seconds: seconds,
              //       updated_at: new Date().toISOString(),
              //     },
              //   }
              // );

              itemHistory.percent = percent;
              itemHistory.seconds = seconds;
              itemHistory.updated_at = new Date();

              await itemHistory.save();
            } else {
              // await History.updateOne(
              //   {
              //     user_id: user.id,
              //     movie_id: movieId,
              //     media_type: 'movie',
              //   },
              //   {
              //     $set: {
              //       percent: percent,
              //       seconds: seconds,
              //       updated_at: new Date().toISOString(),
              //     },
              //   }
              // );

              itemHistory.percent = percent;
              itemHistory.seconds = seconds;
              itemHistory.updated_at = new Date();

              await itemHistory.save();
            }

            return res.json({
              success: true,
              results: 'Add item to history suucessfully'
            });
          }

        case 'tv':
          const tv = await TV.findOne({ id: movieId });

          if (tv == null) {
            throw createHttpError.NotFound('Movie is not exists');
          }

          const itemHistory1 = await History.findOne({
            user_id: user.id,
            movie_id: movieId,
            media_type: 'tv'
          });

          if (itemHistory1 == null) {
            await History.create({
              id: idItemHistory,
              user_id: user.id,
              movie_id: movieId,
              name: tv.name,
              original_name: tv.original_name,
              original_language: tv.original_language,
              media_type: 'tv',
              genres: tv.genres,
              backdrop_path: tv.backdrop_path,
              poster_path: tv.poster_path,
              dominant_backdrop_color: tv.dominant_backdrop_color,
              dominant_poster_color: tv.dominant_poster_color,
              duration,
              percent,
              seconds,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

            return res.json({
              success: true,
              results: 'Add item to history suucessfully'
            });
          } else {
            const oldDuration: number = itemHistory1.duration!;
            const oldSeconds: number = itemHistory1.seconds!;
            const oldPercent: number = itemHistory1.percent!;

            if (seconds > oldSeconds && percent > oldPercent) {
              // await History.updateOne(
              //   {
              //     user_id: user.id,
              //     movie_id: movieId,
              //     media_type: 'tv',
              //   },
              //   {
              //     $set: {
              //       percent: percent,
              //       seconds: seconds,
              //       updated_at: new Date().toISOString(),
              //     },
              //   }
              // );

              itemHistory1.percent = percent;
              itemHistory1.seconds = seconds;
              itemHistory1.updated_at = new Date();

              await itemHistory1.save();
            } else {
              // await History.updateOne(
              //   {
              //     user_id: user.id,
              //     movie_id: movieId,
              //     media_type: 'tv',
              //   },
              //   {
              //     $set: {
              //       percent: percent,
              //       seconds: seconds,
              //       updated_at: new Date().toISOString(),
              //     },
              //   }
              // );

              itemHistory1.percent = percent;
              itemHistory1.seconds = seconds;
              itemHistory1.updated_at = new Date();

              await itemHistory1.save();
            }

            return res.json({
              success: true,
              results: 'Add item to history suucessfully'
            });
          }

        default:
          return next(
            createHttpError.NotFound(
              `Movie with type: ${mediaType} is not found`
            )
          );
      }
    } catch (error) {
      return next(error);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const userToken = res.locals.userToken;
      const user = res.locals.user as User;

      const id: string | null = req.body?.id || null;
      const movieId: string = req.body.movie_id;
      const mediaType: string = req.body.media_type;

      const result = await History.deleteOne({
        user_id: user.id,
        movie_id: movieId,
        media_type: mediaType
      });

      if (result.deletedCount != 1) {
        return next(
          createHttpError.InternalServerError(
            'Delete movie from history failed'
          )
        );
      }

      return res.json({
        success: true,
        results: 'Remove item from history suucessfully'
      });
    } catch (error) {
      return next(error);
    }
  }

  async clear(req: Request, res: Response, next: NextFunction) {
    try {
      const userToken = res.locals.userToken;
      const user = res.locals.user as User;

      const result = await History.deleteMany({
        user_id: user.id
      });

      if (result.deletedCount < 1) {
        return next(
          createHttpError.InternalServerError(
            'Delete all movie from history failed'
          )
        );
      }

      const history = await History.find({ user_id: user.id });

      return res.json({
        success: true,
        results: history
      });
    } catch (error) {
      return next(error);
    }
  }
}

export default new HistoryController();
