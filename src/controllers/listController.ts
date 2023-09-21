import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import List from '@/models/list';
import createHttpError from 'http-errors';
import Movie from '@/models/movie';
import TV from '@/models/tv';
import type { user } from '@/types';

class ListController {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const user_token =
        req.cookies.user_token ||
        req.headers.authorization!.replace('Bearer ', '');

      const user = jwt.verify(user_token, process.env.JWT_SIGNATURE_SECRET!, {
        algorithms: ['HS256'],
      }) as user;

      const skip: number = +req.query?.page! - 1 || 0;
      const limit: number = +req.query?.limit! || 20;
      let data: any[] = [];
      let total: number = 0;

      switch (req.params.slug) {
        case 'all':
          data = await List.find({
            user_id: user.id,
          })
            .skip(skip * limit)
            .limit(limit)
            .sort({ created_at: -1 });

          total = await List.countDocuments({
            user_id: user.id,
          });
          break;
        case 'movie':
          data = await List.find({
            user_id: user.id,
            media_type: 'movie',
          })
            .skip(skip * limit)
            .limit(limit)
            .sort({ created_at: -1 });

          total = await List.countDocuments({
            user_id: user.id,
            media_type: 'movie',
          });
          break;
        case 'tv':
          data = await List.find({
            user_id: user.id,
            media_type: 'tv',
          })
            .skip(skip * limit)
            .limit(limit)
            .sort({ created_at: -1 });

          total = await List.countDocuments({
            user_id: user.id,
            media_type: 'tv',
          });
          break;
        default:
          next(
            createHttpError.NotFound(
              `List with slug: ${req.params.slug} is not found!`
            )
          );
          break;
      }

      return res.json({
        results: data,
        total: total,
      });
    } catch (error) {
      if (
        error instanceof jwt.TokenExpiredError ||
        error instanceof jwt.JsonWebTokenError
      ) {
        res.clearCookie('user_token', {
          domain:
            process.env.NODE_ENV! == 'production'
              ? 'phimhay247z.org'
              : 'localhost',
          httpOnly: req.session.cookie.httpOnly,
          sameSite: req.session.cookie.sameSite,
          secure: true,
        });
      }
      next(error);
    }
  }

  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const user_token =
        req.cookies.user_token ||
        req.headers.authorization!.replace('Bearer ', '');

      const user = jwt.verify(user_token, process.env.JWT_SIGNATURE_SECRET!, {
        algorithms: ['HS256'],
      }) as user;

      const query = req.query?.query || '';
      let data: any[] = [];

      switch (req.params.slug) {
        case 'all':
          data = await List.find({
            user_id: user.id,
            $or: [
              { name: { $regex: query, $options: 'i' } },
              { original_name: { $regex: query, $options: 'i' } },
            ],
          }).sort({ created_at: -1 });
          break;
        case 'movie':
          data = await List.find({
            user_id: user.id,
            media_type: 'movie',
            $or: [
              { name: { $regex: query, $options: 'i' } },
              { original_name: { $regex: query, $options: 'i' } },
            ],
          }).sort({ created_at: -1 });
          break;
        case 'tv':
          data = await List.find({
            user_id: user.id,
            media_type: 'tv',
            $or: [
              { name: { $regex: query, $options: 'i' } },
              { original_name: { $regex: query, $options: 'i' } },
            ],
          }).sort({ created_at: -1 });
          break;
        default:
          next(
            createHttpError.NotFound(
              `List with slug: ${req.params.slug} is not found!`
            )
          );
          break;
      }

      return res.json({
        results: data,
        total: data.length,
      });
    } catch (error) {
      if (
        error instanceof jwt.TokenExpiredError ||
        error instanceof jwt.JsonWebTokenError
      ) {
        res.clearCookie('user_token', {
          domain:
            process.env.NODE_ENV! == 'production'
              ? 'phimhay247z.org'
              : 'localhost',
          httpOnly: req.session.cookie.httpOnly,
          sameSite: req.session.cookie.sameSite,
          secure: true,
        });
      }
      next(error);
    }
  }

  async getItem(req: Request, res: Response, next: NextFunction) {
    try {
      const user_token =
        req.cookies.user_token ||
        req.headers.authorization!.replace('Bearer ', '');

      const user = jwt.verify(user_token, process.env.JWT_SIGNATURE_SECRET!, {
        algorithms: ['HS256'],
      }) as user;

      const data = await List.findOne({
        user_id: user.id,
        movie_id: req.params.movieId,
        media_type: req.params.type,
      });

      if (data != null) {
        return res.json({ success: true, result: data });
      } else {
        return res.json({
          success: false,
          result: 'Failed to get item in list',
        });
      }
    } catch (error) {
      if (
        error instanceof jwt.TokenExpiredError ||
        error instanceof jwt.JsonWebTokenError
      ) {
        res.clearCookie('user_token', {
          domain:
            process.env.NODE_ENV! == 'production'
              ? 'phimhay247z.org'
              : 'localhost',
          httpOnly: req.session.cookie.httpOnly,
          sameSite: req.session.cookie.sameSite,
          secure: true,
        });
      }
      next(error);
    }
  }

  async addItem(req: Request, res: Response, next: NextFunction) {
    try {
      const user_token =
        req.cookies.user_token ||
        req.headers.authorization!.replace('Bearer ', '');

      const user = jwt.verify(user_token, process.env.JWT_SIGNATURE_SECRET!, {
        algorithms: ['HS256'],
      }) as user;

      const movieId: string = req.body.movie_id;
      const mediaType: string = req.body.media_type;
      const idItemList: string = uuidv4();

      switch (mediaType) {
        case 'movie':
          const movie = await Movie.findOne({ id: movieId });

          if (movie != null) {
            const itemList = await List.findOne({
              user_id: user.id,
              movie_id: movieId,
              media_type: 'movie',
            });

            if (itemList == null) {
              await List.create({
                id: idItemList,
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
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });

              res.json({
                success: true,
                results: 'Add item to list suucessfully',
              });
            } else {
              next(
                createHttpError.InternalServerError(
                  'Movie is already exist in list'
                )
              );
            }
          } else {
            next(createHttpError.NotFound('Movie is not exists'));
          }
          break;
        case 'tv':
          const tv = await TV.findOne({ id: movieId });

          if (tv != null) {
            const itemList = await List.findOne({
              user_id: user.id,
              movie_id: movieId,
              media_type: 'tv',
            });

            if (itemList == null) {
              await List.create({
                id: idItemList,
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
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });

              res.json({
                success: true,
                results: 'Add item to list suucessfully',
              });
            } else {
              next(
                createHttpError.InternalServerError(
                  'Movie is already exist in list'
                )
              );
            }
          } else {
            next(createHttpError.NotFound('Movie is not exists'));
          }
          break;
        default:
          next(
            createHttpError.NotFound(
              `Movie with type: ${mediaType} is not found`
            )
          );
          break;
      }
    } catch (error) {
      if (
        error instanceof jwt.TokenExpiredError ||
        error instanceof jwt.JsonWebTokenError
      ) {
        res.clearCookie('user_token', {
          domain:
            process.env.NODE_ENV! == 'production'
              ? 'phimhay247z.org'
              : 'localhost',
          httpOnly: req.session.cookie.httpOnly,
          sameSite: req.session.cookie.sameSite,
          secure: true,
        });
      }
      next(error);
    }
  }

  async removeItem(req: Request, res: Response, next: NextFunction) {
    try {
      const user_token =
        req.cookies.user_token ||
        req.headers.authorization!.replace('Bearer ', '');

      const user = jwt.verify(user_token, process.env.JWT_SIGNATURE_SECRET!, {
        algorithms: ['HS256'],
      }) as user;

      const id: string | null = req.body?.id || null;
      const movieId: string = req.body.movie_id;
      const mediaType: string = req.body.media_type;

      const result = await List.deleteOne({
        user_id: user.id,
        movie_id: movieId,
        media_type: mediaType,
      });

      if (result.deletedCount == 1) {
        res.json({
          success: true,
          results: 'Remove item from list suucessfully',
        });
      } else {
        next(
          createHttpError.InternalServerError('Delete movie from list failed')
        );
      }
    } catch (error) {
      if (
        error instanceof jwt.TokenExpiredError ||
        error instanceof jwt.JsonWebTokenError
      ) {
        res.clearCookie('user_token', {
          domain:
            process.env.NODE_ENV! == 'production'
              ? 'phimhay247z.org'
              : 'localhost',
          httpOnly: req.session.cookie.httpOnly,
          sameSite: req.session.cookie.sameSite,
          secure: true,
        });
      }
      next(error);
    }
  }

  async removeAllItem(req: Request, res: Response, next: NextFunction) {
    try {
      const user_token =
        req.cookies.user_token ||
        req.headers.authorization!.replace('Bearer ', '');

      const user = jwt.verify(user_token, process.env.JWT_SIGNATURE_SECRET!, {
        algorithms: ['HS256'],
      }) as user;

      const result = await List.deleteMany({
        user_id: user.id,
      });

      if (result.deletedCount >= 1) {
        const list = await List.find({ user_id: user.id });

        res.json({
          success: true,
          results: list,
        });
      } else {
        next(
          createHttpError.InternalServerError(
            'Delete all movie from list failed'
          )
        );
      }
    } catch (error) {
      if (
        error instanceof jwt.TokenExpiredError ||
        error instanceof jwt.JsonWebTokenError
      ) {
        res.clearCookie('user_token', {
          domain:
            process.env.NODE_ENV! == 'production'
              ? 'phimhay247z.org'
              : 'localhost',
          httpOnly: req.session.cookie.httpOnly,
          sameSite: req.session.cookie.sameSite,
          secure: true,
        });
      }
      next(error);
    }
  }
}

export default new ListController();
