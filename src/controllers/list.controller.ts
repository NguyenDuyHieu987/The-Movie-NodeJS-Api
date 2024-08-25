import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import { v4 as uuidv4 } from 'uuid';

import List from '@/models/list';
import Movie from '@/models/movie';
import TV from '@/models/tv';
import type { User } from '@/types';

export class ListController {
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
          result.results = await List.find({
            user_id: user.id
          })
            .skip(skip * limit)
            .limit(limit)
            .sort({ created_at: -1 });

          result.total = await List.countDocuments({
            user_id: user.id
          });
          break;
        case 'movie':
          result.results = await List.find({
            user_id: user.id,
            media_type: 'movie'
          })
            .skip(skip * limit)
            .limit(limit)
            .sort({ created_at: -1 });

          result.total = await List.countDocuments({
            user_id: user.id,
            media_type: 'movie'
          });
          break;
        case 'tv':
          result.results = await List.find({
            user_id: user.id,
            media_type: 'tv'
          })
            .skip(skip * limit)
            .limit(limit)
            .sort({ created_at: -1 });

          result.total = await List.countDocuments({
            user_id: user.id,
            media_type: 'tv'
          });
          break;
        default:
          return next(
            createHttpError.NotFound(
              `List with slug: ${req.params.slug} is not found!`
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
          result.results = await List.find({
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
          result.results = await List.find({
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
          result.results = await List.find({
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
              `List with slug: ${req.params.slug} is not found!`
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

      const data = await List.findOne({
        user_id: user.id,
        movie_id: req.params.movieId,
        media_type: req.params.type
      });

      if (data != null) {
        return res.json({ success: true, result: data });
      } else {
        return res.json({
          success: false,
          result: 'This movie is not found in your list'
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
      const idItemList: string = uuidv4();

      const movie = await Movie.findOne({ id: movieId, media_type: mediaType });

      if (movie == null) {
        throw createHttpError.NotFound('Movie is not exists');
      }

      const itemList = await List.findOne({
        user_id: user.id,
        movie_id: movieId,
        media_type: 'movie'
      });

      if (itemList != null) {
        return next(
          createHttpError.InternalServerError('Movie is already exist in list')
        );
      }

      await List.create({
        id: idItemList,
        user_id: user.id,
        movie_id: movieId,
        name: movie.name,
        original_name: movie.original_name,
        original_language: movie.original_language,
        media_type: mediaType,
        genres: movie.genres,
        backdrop_path: movie.backdrop_path,
        poster_path: movie.poster_path,
        dominant_backdrop_color: movie.dominant_backdrop_color,
        dominant_poster_color: movie.dominant_poster_color,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      return res.json({
        success: true,
        results: 'Add item to list suucessfully'
      });
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

      const result = await List.deleteOne({
        user_id: user.id,
        movie_id: movieId,
        media_type: mediaType
      });

      if (result.deletedCount != 1) {
        return next(
          createHttpError.InternalServerError('Delete movie from list failed')
        );
      }

      return res.json({
        success: true,
        results: 'Remove item from list suucessfully'
      });
    } catch (error) {
      return next(error);
    }
  }

  async clear(req: Request, res: Response, next: NextFunction) {
    try {
      const userToken = res.locals.userToken;
      const user = res.locals.user as User;

      const result = await List.deleteMany({
        user_id: user.id
      });

      if (result.deletedCount < 1) {
        return next(
          createHttpError.InternalServerError(
            'Delete all movie from list failed'
          )
        );
      }

      const list = await List.find({ user_id: user.id });

      return res.json({
        success: true,
        results: list
      });
    } catch (error) {
      return next(error);
    }
  }
}

export default new ListController();
