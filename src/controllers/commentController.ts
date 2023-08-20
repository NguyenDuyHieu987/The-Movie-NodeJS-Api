import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';
import { v4 as uuidv4 } from 'uuid';
import Comment from '@/models/comment';
import type { commentForm, user } from '@/types';
import Movie from '@/models/movie';
import TV from '@/models/tv';

class CommentController {
  async getParent(req: Request, res: Response, next: NextFunction) {
    try {
      const skip: number = +req.query?.page! - 1 || 0;
      const limit: number = +req.query?.limit! || 20;

      const movieId: string = req.params.movieId;
      const movieType: string = req.params.movieType;

      const comment = await Comment.find({
        movie_id: movieId,
        movie_type: movieType,
        type: 'parent',
      })
        .sort({ created_at: -1 })
        .skip(skip * limit)
        .limit(limit);

      res.json({ results: comment });
    } catch (error) {
      next(error);
    }
  }

  async getChild(req: Request, res: Response, next: NextFunction) {
    try {
      const skip: number = +req.query?.page! - 1 || 0;
      const limit: number = +req.query?.limit! || 20;

      const movieId: string = req.params.movieId;
      const movieType: string = req.params.movieType;
      const parentId: string = req.params.parentId;

      const comment = await Comment.find({
        movie_id: movieId,
        parent_id: parentId,
        movie_type: movieType,
        type: 'children',
      })
        .sort({ created_at: -1 })
        .skip(skip * limit)
        .limit(limit);

      res.json({ results: comment });
    } catch (error) {
      next(error);
    }
  }

  async post(req: Request, res: Response, next: NextFunction) {
    try {
      const user_token = req.headers.authorization!.replace('Bearer ', '');

      const user = jwt.verify(user_token, process.env.JWT_SIGNATURE_SECRET!, {
        algorithms: ['HS256'],
      }) as user;

      const movieId: string = req.params.movieId;
      const movieType: string = req.params.movieType;

      let isExistMovies = false;

      switch (movieType) {
        case 'movie':
          isExistMovies = (await Movie.findOne({ id: movieId })) != null;
          break;
        case 'tv':
          isExistMovies = (await TV.findOne({ id: movieId })) != null;
          break;
        default:
          next(
            createHttpError.NotFound(
              `Movie with type: ${movieType} is not found`
            )
          );
          break;
      }

      if (isExistMovies) {
        const commentForm: commentForm = req.body;

        if (commentForm.content.length == 0) {
          return next(
            createHttpError.NotFound('Content comment is not allowed empty')
          );
        }

        const idComment: string = uuidv4();

        let result = null;

        if (commentForm.hasOwnProperty('parent_id')) {
          if (
            commentForm.parent_id != undefined &&
            commentForm.parent_id != null
          ) {
            result = await Comment.create({
              id: idComment,
              content: commentForm.content,
              user_id: user.id,
              username: user.username,
              user_avatar: user.avatar,
              movie_id: movieId,
              movie_type: movieType,
              parent_id: commentForm.parent_id,
              type: 'children',
              childrens: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

            if (result != null) {
              await Comment.updateOne(
                {
                  id: commentForm.parent_id,
                  movie_id: movieId,
                  movie_type: movieType,
                  type: 'parent',
                },
                {
                  $inc: { childrens: 1 },
                }
              );
            }
          }
        } else {
          result = await Comment.create({
            id: idComment,
            content: commentForm.content,
            user_id: user.id,
            username: user.username,
            user_avatar: user.avatar,
            movie_id: movieId,
            movie_type: movieType,
            parent_id: null,
            type: commentForm?.type || 'parent',
            childrens: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }

        if (result != null) {
          return res.json({
            success: true,
            result: {
              id: idComment,
              content: commentForm.content,
              user_id: user.id,
              username: user.username,
              user_avatar: user.avatar,
              movie_id: movieId,
              movie_type: movieType,
              parent_id: commentForm?.parent_id || null,
              type: commentForm?.type || 'parent',
              childrens: 0,
              created_at: result.created_at,
              updated_at: result.updated_at,
            },
          });
        } else {
          return next(
            createHttpError.InternalServerError('Post comment failed')
          );
        }
      } else {
        return next(createHttpError.NotFound('Movie is not exists'));
      }
    } catch (error) {
      next(error);
    }
  }

  async edit(req: Request, res: Response, next: NextFunction) {
    try {
      const user_token = req.headers.authorization!.replace('Bearer ', '');

      const user = jwt.verify(user_token, process.env.JWT_SIGNATURE_SECRET!, {
        algorithms: ['HS256'],
      }) as user;

      const movieId: string = req.params.movieId;
      const movieType: string = req.params.movieType;

      let isExistMovies = false;

      switch (movieType) {
        case 'movie':
          isExistMovies = (await Movie.findOne({ id: movieId })) != null;
          break;
        case 'tv':
          isExistMovies = (await TV.findOne({ id: movieId })) != null;
          break;
        default:
          next(
            createHttpError.NotFound(
              `Movie with type: ${movieType} is not found`
            )
          );
          break;
      }

      if (isExistMovies) {
        const commentForm: commentForm = req.body;

        const result = await Comment.updateOne(
          {
            id: commentForm.id,
            user_id: user.id,
            movie_id: movieId,
            movie_type: movieType,
          },
          {
            $set: {
              content: commentForm['content'],
              updated: true,
              updated_at: new Date().toISOString(),
            },
          }
        );

        if (result.matchedCount == 1) {
          return res.json({ success: true, content: commentForm.content });
        } else {
          return createHttpError.InternalServerError('Update comment failed');
        }
      } else {
        return createHttpError.NotFound('Movie is not exists');
      }
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const user_token = req.headers.authorization!.replace('Bearer ', '');

      const user = jwt.verify(user_token, process.env.JWT_SIGNATURE_SECRET!, {
        algorithms: ['HS256'],
      }) as user;

      const movieId: string = req.params.movieId;
      const movieType: string = req.params.movieType;

      let isExistMovies = false;

      switch (movieType) {
        case 'movie':
          isExistMovies = (await Movie.findOne({ id: movieId })) != null;
          break;
        case 'tv':
          isExistMovies = (await TV.findOne({ id: movieId })) != null;
          break;
        default:
          next(
            createHttpError.NotFound(
              `Movie with type: ${movieType} is not found`
            )
          );
          break;
      }

      if (isExistMovies) {
        const commentForm: commentForm = req.body;

        if (commentForm.type == 'parent') {
          const result1 = await Comment.deleteOne({
            id: commentForm.id,
            user_id: user.id,
            movie_id: movieId,
            movie_type: movieType,
            parent_id: null,
            type: 'parent',
          });

          const result2 = await Comment.deleteMany({
            movie_id: movieId,
            movie_type: movieType,
            parent_id: commentForm.id,
            type: 'children',
          });

          if (result1.deletedCount == 1 && result2.deletedCount >= 1) {
            return res.json({
              success: true,
            });
          } else {
            next(createHttpError.InternalServerError('Delete comment failed'));
          }
        } else if (commentForm.type == 'children') {
          const result1 = await Comment.deleteOne({
            id: commentForm.id,
            user_id: user.id,
            movie_id: movieId,
            movie_type: movieType,
            parent_id: commentForm?.parent_id || null,
            type: 'children',
          });

          const result2 = await Comment.updateOne(
            {
              id: commentForm.parent_id,
              movie_id: movieId,
              movie_type: movieType,
              type: 'parent',
            },
            {
              $inc: { childrens: -1 },
            }
          );

          if (result1.deletedCount == 1 && result2.modifiedCount == 1) {
            return res.json({
              success: true,
            });
          } else {
            next(createHttpError.InternalServerError('Delete comment failed'));
          }
        }
      } else {
        return createHttpError.NotFound('Movie is not exists');
      }
    } catch (error) {
      next(error);
    }
  }
}

export default new CommentController();
