import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import Trending from '@/models/trending';
import RedisCache from '@/config/redis';
import { user } from '@/types';

class TrendingController extends RedisCache {
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

      let listHistory: any[] = [];

      if (req.headers?.authorization) {
        const user_token = req.headers.authorization.replace('Bearer ', '');
        const user = jwt.verify(
          user_token,
          process.env.JWT_SIGNATURE_SECRET!
        ) as user;

        listHistory = [
          {
            $lookup: {
              from: 'lists',
              localField: 'id',
              foreignField: 'movie_id',
              let: {
                media_type: '$$this.media_type',
              },
              pipeline: [
                {
                  $match: {
                    $and: [
                      // { $expr: { $eq: ['$media_type', '$$this.media_type'] } },
                      { $expr: { $eq: ['$user_id', user.id] } },
                    ],
                  },
                },
              ],
              as: 'in_list',
            },
          },
          {
            $addFields: {
              in_list: {
                $eq: [{ $size: '$in_list' }, 1],
              },
            },
          },
          {
            $lookup: {
              from: 'histories',
              localField: 'id',
              foreignField: 'movie_id',
              pipeline: [
                {
                  $match: {
                    $and: [
                      // { $expr: { $eq: ['$media_type', '$$this.media_type'] } },
                      { $expr: { $eq: ['$user_id', user.id] } },
                    ],
                  },
                },
              ],
              as: 'history_progress',
            },
          },
          { $unwind: '$history_progress' },
          {
            $addFields: {
              history_progress: {
                duration: '$history_progress.duration',
                percent: '$history_progress.percent',
                seconds: '$history_progress.seconds',
              },
            },
          },
        ];
      }

      switch (req.params.slug) {
        case 'all':
          data = await Trending.find()
            .skip(page * limit)
            .limit(limit);

          // data = await Trending.aggregate([
          //   {
          //     $skip: page * limit,
          //   },
          //   {
          //     $limit: limit,
          //   },
          //   ...listHistory,
          // ]);

          total = await Trending.countDocuments({});

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
        total: total,
        page_size: limit,
      };

      await RedisCache.client.setEx(
        key,
        +process.env.REDIS_CACHE_TIME!,
        JSON.stringify(response)
      );

      res.json(response);
    } catch (error) {
      next(error);
    } finally {
    }
  }
}

export default new TrendingController();
