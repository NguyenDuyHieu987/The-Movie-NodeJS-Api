import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import { v4 as uuidv4 } from 'uuid';

import Comment from '@/models/comment';
import CommentLike from '@/models/commentLike';
import Movie from '@/models/movie';
import TV from '@/models/tv';
import type { CommentForm, User } from '@/types';

class CommentController {
  async getParent(req: Request, res: Response, next: NextFunction) {
    try {
      const skip: number = +req.query.skip! - 1 || 0;
      const limit: number = +req.query.limit! || 20;

      const movieId: string = req.params.movieId;
      const movieType: string = req.params.movieType;

      // const comment = await Comment.find({
      //   movie_id: movieId,
      //   movie_type: movieType,
      //   type: 'parent',
      // })
      //   .sort({ created_at: -1 })
      //   .skip(skip * limit)
      //   .limit(limit);

      let likeDislike: any[] = [];

      if (req.headers?.authorization || req.cookies?.user_token) {
        const userToken = res.locals.userToken;
        const user = res.locals.user as User;

        likeDislike = [
          {
            $lookup: {
              from: 'commentlikes',
              localField: 'id',
              foreignField: 'comment_id',
              pipeline: [
                {
                  $match: {
                    $and: [
                      { $expr: { $eq: ['$type', 'like'] } },
                      { $expr: { $eq: ['$user_id', user.id] } }
                    ]
                  }
                }
              ],
              as: 'is_like'
            }
          },
          {
            $addFields: {
              is_like: {
                $eq: [{ $size: '$is_like' }, 1]
              }
            }
          },
          {
            $lookup: {
              from: 'commentlikes',
              localField: 'id',
              foreignField: 'comment_id',
              pipeline: [
                {
                  $match: {
                    $and: [
                      { $expr: { $eq: ['$type', 'dislike'] } },
                      { $expr: { $eq: ['$user_id', user.id] } }
                    ]
                  }
                }
              ],
              as: 'is_dislike'
            }
          },
          {
            $addFields: {
              is_dislike: {
                $eq: [{ $size: '$is_dislike' }, 1]
              }
            }
          }
        ];
      }

      const comment = await Comment.aggregate([
        {
          $match: {
            movie_id: movieId,
            movie_type: movieType,
            type: 'parent'
          }
        },
        {
          $skip: skip * limit
        },
        {
          $limit: limit
        },
        {
          $lookup: {
            from: 'comments',
            localField: 'id',
            foreignField: 'parent_id',
            as: 'childrens'
          }
        },
        {
          $addFields: {
            childrens: { $size: '$childrens' }
          }
        },
        {
          $lookup: {
            from: 'commentlikes',
            localField: 'id',
            foreignField: 'comment_id',
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$type', 'like'] }
                }
              }
            ],
            as: 'like'
          }
        },
        {
          $addFields: {
            like: { $size: '$like' }
          }
        },
        {
          $lookup: {
            from: 'commentlikes',
            localField: 'id',
            foreignField: 'comment_id',
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$type', 'dislike'] }
                }
              }
            ],
            as: 'dislike'
          }
        },
        {
          $addFields: {
            dislike: { $size: '$dislike' }
          }
        },
        {
          $sort: {
            created_at: -1
            // like: -1,
            // dislike: -1,
          }
        },
        ...likeDislike,
        {
          $lookup: {
            from: 'accounts',
            localField: 'user_id',
            foreignField: 'id',
            as: 'user'
          }
        },
        {
          $unwind: '$user'
        },
        {
          $project: {
            root: '$$ROOT',
            user_avatar: '$user.avatar'
          }
        },
        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: ['$root', '$$ROOT']
            }
          }
        },
        {
          $project: {
            root: 0,
            user: 0
          }
        }
      ]);

      const total = await Comment.countDocuments({
        movie_id: movieId,
        movie_type: movieType
      });

      return res.json({ results: comment, total });
    } catch (error) {
      return next(error);
    }
  }

  async getChild(req: Request, res: Response, next: NextFunction) {
    try {
      const skip: number = +req.query.skip! - 1 || 0;
      const limit: number = +req.query.limit! || 20;

      const movieId: string = req.params.movieId;
      const movieType: string = req.params.movieType;
      const parentId: string = req.params.parentId;

      // const comment = await Comment.find({
      //   movie_id: movieId,
      //   parent_id: parentId,
      //   movie_type: movieType,
      //   type: 'children',
      // })
      //   .sort({ created_at: -1 })
      //   .skip(skip * limit)
      //   .limit(limit);

      let likeDislike: any[] = [];

      if (req.headers?.authorization || req.cookies?.user_token) {
        const userToken = res.locals.userToken;
        const user = res.locals.user as User;

        likeDislike = [
          {
            $lookup: {
              from: 'commentlikes',
              localField: 'id',
              foreignField: 'comment_id',
              pipeline: [
                {
                  $match: {
                    $and: [
                      { $expr: { $eq: ['$type', 'like'] } },
                      { $expr: { $eq: ['$user_id', user.id] } }
                    ]
                  }
                }
              ],
              as: 'is_like'
            }
          },
          {
            $addFields: {
              is_like: {
                $eq: [{ $size: '$is_like' }, 1]
              }
            }
          },
          {
            $lookup: {
              from: 'commentlikes',
              localField: 'id',
              foreignField: 'comment_id',
              pipeline: [
                {
                  $match: {
                    $and: [
                      { $expr: { $eq: ['$type', 'dislike'] } },
                      { $expr: { $eq: ['$user_id', user.id] } }
                    ]
                  }
                }
              ],
              as: 'is_dislike'
            }
          },
          {
            $addFields: {
              is_dislike: {
                $eq: [{ $size: '$is_dislike' }, 1]
              }
            }
          }
        ];
      }

      const comment = await Comment.aggregate([
        {
          $match: {
            movie_id: movieId,
            parent_id: parentId,
            movie_type: movieType,
            type: 'children'
          }
        },
        {
          $skip: skip * limit
        },
        {
          $limit: limit
        },
        {
          $lookup: {
            from: 'commentlikes',
            localField: 'id',
            foreignField: 'comment_id',
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$type', 'like'] }
                }
              }
            ],
            as: 'like'
          }
        },
        {
          $addFields: {
            like: { $size: '$like' }
          }
        },
        {
          $lookup: {
            from: 'commentlikes',
            localField: 'id',
            foreignField: 'comment_id',
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$type', 'dislike'] }
                }
              }
            ],
            as: 'dislike'
          }
        },
        {
          $addFields: {
            dislike: { $size: '$dislike' }
          }
        },
        {
          $sort: {
            created_at: 1
            // like: -1,
            // dislike: -1,
          }
        },
        ...likeDislike,
        {
          $lookup: {
            from: 'accounts',
            localField: 'user_id',
            foreignField: 'id',
            as: 'user'
          }
        },
        {
          $unwind: '$user'
        },
        {
          $project: {
            root: '$$ROOT',
            user_avatar: '$user.avatar'
          }
        },
        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: ['$root', '$$ROOT']
            }
          }
        },
        {
          $project: {
            root: 0,
            user: 0
          }
        }
      ]);

      return res.json({ results: comment });
    } catch (error) {
      return next(error);
    }
  }

  async post(req: Request, res: Response, next: NextFunction) {
    try {
      const userToken = res.locals.userToken;
      const user = res.locals.user as User;

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
          return next(
            createHttpError.NotFound(
              `Movie with type: ${movieType} is not found`
            )
          );
      }

      if (!isExistMovies) {
        throw createHttpError.NotFound('Movie is not exists');
      }

      const commentForm: CommentForm = req.body;

      if (commentForm.content.length == 0) {
        return next(
          createHttpError.NotFound('Content comment is not allowed empty')
        );
      }

      const idComment: string = uuidv4();

      let result = null;

      if (
        commentForm.type == 'children' &&
        Object.hasOwnProperty.bind(commentForm)('parent_id')
      ) {
        if (
          commentForm.parent_id != undefined &&
          commentForm.parent_id != null
        ) {
          result = await Comment.create({
            id: idComment,
            content: commentForm.content,
            user_id: user.id,
            username: user.username,
            // user_avatar: user.avatar,
            movie_id: movieId,
            movie_type: movieType,
            parent_id: commentForm.parent_id,
            reply_to: commentForm.reply_to,
            type: 'children',
            // childrens: 0,
            // like: 0,
            // dislike: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

          // if (result != null) {
          //   await Comment.updateOne(
          //     {
          //       id: commentForm.parent_id,
          //       movie_id: movieId,
          //       movie_type: movieType,
          //       type: 'parent',
          //     },
          //     {
          //       $inc: { childrens: 1 },
          //     }
          //   );
          // }

          if (result == null) {
            return next(
              createHttpError.InternalServerError('Post comment failed')
            );
          }
        }
      } else {
        result = await Comment.create({
          id: idComment,
          content: commentForm.content,
          user_id: user.id,
          username: user.username,
          // user_avatar: user.avatar,
          movie_id: movieId,
          movie_type: movieType,
          type: commentForm?.type || 'parent',
          // parent_id: null,
          // childrens: 0,
          // like: 0,
          // dislike: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }

      if (result == null) {
        throw createHttpError.InternalServerError('Post comment failed');
      }

      return res.json({
        success: true,
        result: {
          id: idComment,
          content: result.content,
          user_id: user.id,
          username: user.username,
          user_avatar: user.avatar,
          movie_id: movieId,
          movie_type: movieType,
          type: result?.type || 'parent',
          parent_id: result?.parent_id || null,
          reply_to: result?.reply_to || null,
          childrens: 0,
          like: 0,
          dislike: 0,
          created_at: result.created_at,
          updated_at: result.updated_at
        }
      });
    } catch (error) {
      return next(error);
    }
  }

  async edit(req: Request, res: Response, next: NextFunction) {
    try {
      const userToken = res.locals.userToken;
      const user = res.locals.user as User;

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
          return next(
            createHttpError.NotFound(
              `Movie with type: ${movieType} is not found`
            )
          );
      }

      if (!isExistMovies) {
        throw createHttpError.NotFound('Movie is not exists');
      }

      const commentForm: CommentForm = req.body;

      const result = await Comment.updateOne(
        {
          id: commentForm.id,
          user_id: user.id,
          movie_id: movieId,
          movie_type: movieType
        },
        {
          $set: {
            content: commentForm.content,
            updated: true,
            updated_at: new Date().toISOString()
          }
        }
      );

      if (result.matchedCount != 1) {
        return next(
          createHttpError.InternalServerError('Update comment failed')
        );
      }

      return res.json({ success: true, content: commentForm.content });
    } catch (error) {
      return next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const userToken = res.locals.userToken;
      const user = res.locals.user as User;

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
          return next(
            createHttpError.NotFound(
              `Movie with type: ${movieType} is not found`
            )
          );
      }

      if (!isExistMovies) {
        throw createHttpError.NotFound('Movie is not exists');
      }

      const commentForm: CommentForm = req.body;

      if (commentForm.type == 'parent') {
        const result1 = await Comment.deleteOne({
          id: commentForm.id,
          user_id: user.id,
          movie_id: movieId,
          movie_type: movieType,
          parent_id: null,
          type: 'parent'
        });

        const childrens = await Comment.find({
          movie_id: movieId,
          movie_type: movieType,
          parent_id: commentForm.id,
          type: 'children'
        });

        if (childrens.length > 0) {
          const result2 = await Comment.deleteMany({
            movie_id: movieId,
            movie_type: movieType,
            parent_id: commentForm.id,
            type: 'children'
          });

          if (result1.deletedCount == 1 && result2.deletedCount >= 1) {
            return res.json({
              success: true
            });
          } else {
            return next(
              createHttpError.InternalServerError('Delete comment failed')
            );
          }
        } else if (childrens.length == 0) {
          if (result1.deletedCount != 1) {
            return next(
              createHttpError.InternalServerError('Delete comment failed')
            );
          }

          return res.json({
            success: true
          });
        }
      } else if (commentForm.type == 'children') {
        const result1 = await Comment.deleteOne({
          id: commentForm.id,
          user_id: user.id,
          movie_id: movieId,
          movie_type: movieType,
          parent_id: commentForm?.parent_id || null,
          type: 'children'
        });

        // const result2 = await Comment.updateOne(
        //   {
        //     id: commentForm.parent_id,
        //     movie_id: movieId,
        //     movie_type: movieType,
        //     type: 'parent',
        //   },
        //   {
        //     $inc: { childrens: -1 },
        //   }
        // );

        if (
          result1.deletedCount == 1
          //  &&  result2.modifiedCount == 1
        ) {
          return res.json({
            success: true
          });
        } else {
          return next(
            createHttpError.InternalServerError('Delete comment failed')
          );
        }
      }
    } catch (error) {
      return next(error);
    }
  }

  async like(req: Request, res: Response, next: NextFunction) {
    try {
      const userToken = res.locals.userToken;
      const user = res.locals.user as User;

      const commentId: string = req.params.id;

      const isLike = await CommentLike.findOne({
        user_id: user.id,
        comment_id: commentId,
        type: 'like'
      });

      const isDisLike = await CommentLike.findOne({
        user_id: user.id,
        comment_id: commentId,
        type: 'dislike'
      });

      if (isDisLike != null) {
        const result = await CommentLike.deleteOne({
          user_id: user.id,
          comment_id: commentId,
          type: 'dislike'
        });

        // const result2 = await Comment.findOneAndUpdate(
        //   {
        //     id: commentId,
        //   },
        //   {
        //     $inc: { dislike: -1 },
        //   },
        //   {
        //     returnDocument: 'after',
        //   }
        // );

        if (
          result.deletedCount < 1
          // || result2 == null
        ) {
          return next(
            createHttpError.InternalServerError('Like comment failed')
          );
        }
      }

      if (isLike == null) {
        const result = await CommentLike.create({
          id: uuidv4(),
          user_id: user.id,
          comment_id: commentId,
          type: 'like',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        if (result == null) {
          return next(
            createHttpError.InternalServerError('Like comment failed')
          );
        }

        // const result2 = await Comment.findOneAndUpdate(
        //   {
        //     id: commentId,
        //   },
        //   {
        //     $inc: { like: 1 },
        //   },
        //   {
        //     returnDocument: 'after',
        //   }
        // );

        // if (result2 != null) {
        return res.json({
          success: true,
          action: 'like'
          // like: result2.like,
        });
        // } else {
        //   return next(
        //     createHttpError.InternalServerError('Like comment failed')
        //   );
        // }
      } else {
        const result = await CommentLike.deleteOne({
          user_id: user.id,
          comment_id: commentId,
          type: 'like'
        });

        if (result.deletedCount != 1) {
          return next(
            createHttpError.InternalServerError('Unlike comment failed')
          );
        }

        // const result2 = await Comment.findOneAndUpdate(
        //   {
        //     id: commentId,
        //   },
        //   {
        //     $inc: { like: -1 },
        //   },
        //   {
        //     returnDocument: 'after',
        //   }
        // );

        // if (result2 != null) {
        return res.json({
          success: true,
          action: 'unlike'
          // like: result2.like,
        });
        // } else {
        //   return next(
        //     createHttpError.InternalServerError('Unlike comment failed')
        //   );
        // }
      }
    } catch (error) {
      return next(error);
    }
  }

  async dislike(req: Request, res: Response, next: NextFunction) {
    try {
      const userToken = res.locals.userToken;
      const user = res.locals.user as User;

      const commentId: string = req.params.id;

      const isDisLike = await CommentLike.findOne({
        user_id: user.id,
        comment_id: commentId,
        type: 'dislike'
      });

      const isLike = await CommentLike.findOne({
        user_id: user.id,
        comment_id: commentId,
        type: 'like'
      });

      if (isLike != null) {
        const result = await CommentLike.deleteOne({
          user_id: user.id,
          comment_id: commentId,
          type: 'like'
        });

        // const result2 = await Comment.findOneAndUpdate(
        //   {
        //     id: commentId,
        //   },
        //   {
        //     $inc: { like: -1 },
        //   },
        //   {
        //     returnDocument: 'after',
        //   }
        // );

        if (
          result.deletedCount < 1
          // || result2 == null
        ) {
          return next(
            createHttpError.InternalServerError('Dislike comment failed')
          );
        }
      }

      if (isDisLike == null) {
        const result = await CommentLike.create({
          id: uuidv4(),
          user_id: user.id,
          comment_id: commentId,
          type: 'dislike',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        if (result == null) {
          return next(
            createHttpError.InternalServerError('Dislike comment failed')
          );
        }

        // const result2 = await Comment.findOneAndUpdate(
        //   {
        //     id: commentId,
        //   },
        //   {
        //     $inc: { dislike: 1 },
        //   },
        //   {
        //     returnDocument: 'after',
        //   }
        // );

        // if (result2 != null) {
        return res.json({
          success: true,
          action: 'dislike'
          // dislike: result2.dislike,
        });
        // } else {
        //   return next(
        //     createHttpError.InternalServerError('Dislike comment failed')
        //   );
        // }
      } else {
        const result = await CommentLike.deleteOne({
          user_id: user.id,
          comment_id: commentId,
          type: 'dislike'
        });

        if (result.deletedCount != 1) {
          return next(
            createHttpError.InternalServerError('Undislike comment failed')
          );
        }

        // const result2 = await Comment.findOneAndUpdate(
        //   {
        //     id: commentId,
        //   },
        //   {
        //     $inc: { dislike: -1 },
        //   },
        //   {
        //     returnDocument: 'after',
        //   }
        // );

        // if (result2 != null) {
        return res.json({
          success: true,
          action: 'undislike'
          // dislike: result2.dislike,
        });
        // } else {
        //   return next(
        //     createHttpError.InternalServerError('Undislike comment failed')
        //   );
        // }
      }
    } catch (error) {
      return next(error);
    }
  }

  async checkLikeDislike(req: Request, res: Response, next: NextFunction) {
    try {
      const userToken = res.locals.userToken;
      const user = res.locals.user as User;

      const commentId: string = req.params.id;

      const isLike = await CommentLike.findOne({
        user_id: user.id,
        comment_id: commentId,
        type: 'like'
      });

      if (isLike != null) {
        return res.json({
          success: true,
          type: 'like'
        });
      }

      const isDisLike = await CommentLike.findOne({
        user_id: user.id,
        comment_id: commentId,
        type: 'dislike'
      });

      if (isDisLike != null) {
        return res.json({
          success: true,
          type: 'dislike'
        });
      }

      return res.json({
        success: false
      });
    } catch (error) {
      return next(error);
    }
  }
}

export default new CommentController();
