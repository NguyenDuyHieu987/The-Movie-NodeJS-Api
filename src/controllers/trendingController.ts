import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';

import RedisCache from '@/config/redis';
import Trending from '@/models/trending';
import { user } from '@/types';

class TrendingController extends RedisCache {
  async getSlug(req: Request, res: Response, next: NextFunction) {
    try {
      const page: number = +req.query.page! - 1 || 0;
      const limit: number = +req.query.limit! || 20;
      const key: string = req.originalUrl;
      const dataCache: any = await RedisCache.client.get(key);

      if (dataCache != null) {
        return res.json(JSON.parse(dataCache));
      }

      let data: any[] = [];
      let total: number = 0;

      switch (req.params.slug) {
        case 'all':
          data = await Trending.find()
            .skip(page * limit)
            .limit(limit);

          total = await Trending.countDocuments({});
          break;
        case 'movie':
          data = await Trending.find({ media_type: 'movie' })
            .skip(page * limit)
            .limit(limit);

          total = await Trending.countDocuments({ media_type: 'movie' });
          break;
        case 'tv':
          data = await Trending.find({ media_type: 'tv' })
            .skip(page * limit)
            .limit(limit);

          total = await Trending.countDocuments({ media_type: 'tv' });
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
        total,
        page_size: limit
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

  async test(req: Request, res: Response, next: NextFunction) {
    const page: number = +req.query.page! - 1 || 0;
    const limit: number = +req.query.limit! || 20;

    let listHistory: any[] = [];

    if (!req.headers?.authorization) {
      // const user_token =
      //   req.cookies?.user_token ||
      //   req.headers.authorization!.replace('Bearer ', '');

      // const user = jwt.verify(
      //   user_token,
      //   process.env.JWT_SIGNATURE_SECRET!
      // ) as user;

      listHistory = [
        {
          $lookup: {
            from: 'lists',
            localField: 'id',
            foreignField: 'movie_id',
            let: {
              media_type: '$media_type'
            },
            pipeline: [
              {
                $match: {
                  $and: [
                    { $expr: { $eq: ['$media_type', '$$media_type'] } },
                    { $expr: { $eq: ['$user_id', '1680242193086'] } }
                  ]
                }
              }
            ],
            as: 'in_list'
          }
        },
        {
          $addFields: {
            in_list: {
              $eq: [{ $size: '$in_list' }, 1]
            }
          }
        },
        {
          $lookup: {
            from: 'histories',
            localField: 'id',
            foreignField: 'movie_id',
            let: {
              media_type: '$media_type'
            },
            pipeline: [
              {
                $match: {
                  $and: [
                    { $expr: { $eq: ['$media_type', '$$media_type'] } },
                    { $expr: { $eq: ['$user_id', '1680242193086'] } }
                  ]
                }
              }
            ],
            as: 'history_progress'
          }
        },
        {
          $addFields: {
            history_progress: {
              $cond: [
                {
                  $eq: [{ $size: '$history_progress' }, 1]
                },
                {
                  duration: '$history_progress.duration',
                  percent: '$history_progress.percent',
                  seconds: '$history_progress.seconds'
                },
                '$$REMOVE'
              ]
            }
          }
        }
      ];
    }

    const data = await Trending.aggregate([
      {
        $lookup: {
          from: 'movies',
          localField: 'id',
          foreignField: 'id',
          as: 'detail'
        }
      },
      // Get some fields
      // {
      //   $project: {
      //     id: 1,
      //     name: 1,
      //     // Add other fields from localCollection as needed

      //     // Add fields from foreignCollection
      //     foreignField1: '$detail.genres',
      //     foreignField2: '$detail.views',
      //     // Add other fields from foreignCollection as needed
      //   },
      // },
      // Get all field
      { $unwind: '$detail' },
      {
        $replaceRoot: { newRoot: { $mergeObjects: ['$detail', '$$ROOT'] } }
      },
      {
        $project: { detail: 0 } // Remove detail field
      },
      // ...listHistory,
      {
        $skip: page * limit
      },
      {
        $limit: limit
      }
    ]);

    return res.json(data);
  }
}

export default new TrendingController();
