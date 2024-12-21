import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';

import { RedisCache } from '@/config/redis';
import Broadcast from '@/models/broadcast';

export class BroadcastController extends RedisCache {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const key: string = req.originalUrl;
      const page: number = +req.query.page! - 1 || 0;
      const limit: number = +req.query.limit! || 20;
      const dataCache: any = await RedisCache.client.get(key);

      if (dataCache != null) {
        return res.json(JSON.parse(dataCache));
      }

      const data = await Broadcast.aggregate([
        {
          $lookup: {
            from: 'movies',
            localField: 'movie_id',
            foreignField: 'id',
            as: 'movieData'
          }
        },
        {
          $unwind: '$movieData'
        },
        // {
        //   $replaceRoot: {
        //     newRoot: {
        //       $mergeObjects: [
        //         {
        //           modData: '$modData'
        //         },
        //         '$movieData'
        //       ]
        //     }
        //   }
        // },
        // {
        //   $match: {
        //     'modData.type': slug,
        //     $or: [
        //       { $and: [releaseDate, genres, originalLanguage] },
        //       { $and: [firstAirDate, genres, originalLanguage] }
        //     ]
        //   }
        // },
        {
          $skip: page * limit
        },
        {
          $limit: limit
        }
      ]);

      const response = { results: data };

      await RedisCache.client.setEx(
        key,
        +process.env.REDIS_CACHE_TIME!,
        JSON.stringify(response)
      );

      return res.json(response);
    } catch (error) {
      return next(error);
    }
  }

  async getAllAiring(req: Request, res: Response, next: NextFunction) {
    try {
      const key: string = req.originalUrl;
      const page: number = +req.query.page! - 1 || 0;
      const limit: number = +req.query.limit! || 20;
      // const dataCache: any = await RedisCache.client.get(key);

      // if (dataCache != null) {
      //   return res.json(JSON.parse(dataCache));
      // }

      const data = await Broadcast.aggregate([
        {
          $lookup: {
            from: 'movies',
            localField: 'movie_id',
            foreignField: 'id',
            as: 'movieData'
          }
        },
        {
          $unwind: '$movieData'
        },
        {
          $addFields: {
            // Kiểm tra nếu release_date là kiểu 'string' rồi chuyển nó sang kiểu 'Date'
            release_time: {
              $cond: {
                if: { $eq: [{ $type: '$release_time' }, 'string'] }, // Nếu kiểu là 'string'
                then: { $toDate: '$release_time' }, // Chuyển thành 'Date'
                else: '$release_time' // Giữ nguyên nếu đã là 'Date'
              }
            },
            // Chuyển movieData.runtime sang kiểu Number nếu nó là kiểu string
            movie_runtime_in_ms: {
              $cond: {
                if: { $eq: [{ $type: '$movieData.runtime' }, 'string'] },
                then: { $toDouble: '$movieData.runtime' }, // Chuyển thành số
                else: '$movieData.runtime' // Giữ nguyên nếu đã là số
              }
            }
          }
        },
        {
          $addFields: {
            releaseEndTime: {
              $add: ['$release_time', '$movie_runtime_in_ms']
            }
          }
        },
        {
          $match: {
            releaseEndTime: { $gte: new Date() } // Lọc các broadcast mà releaseEndTime >= thời gian hiện tại
          }
        },
        {
          $skip: page * limit
        },
        {
          $limit: limit
        }
      ]);

      const response = { results: data };

      // await RedisCache.client.setEx(
      //   key,
      //   +process.env.REDIS_CACHE_TIME!,
      //   JSON.stringify(response)
      // );

      return res.json(response);
    } catch (error) {
      return next(error);
    }
  }

  async detail(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await Broadcast.aggregate([
        {
          $match: { id: req.params.id }
        },
        {
          $lookup: {
            from: 'movies',
            localField: 'movie_id',
            foreignField: 'id',
            as: 'movieData'
          }
        },
        {
          $unwind: '$movieData'
        }
      ]);

      if (data.length == 0) {
        return next(
          createHttpError.NotFound(
            `Broadcast with id: ${req.params.id} is not found`
          )
        );
      }

      return res.json(data[0]);
    } catch (error) {
      return next(error);
    }
  }
}

export default new BroadcastController();
