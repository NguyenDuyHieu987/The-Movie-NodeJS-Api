import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';

import { RedisCache } from '@/config/redis';
import Mod from '@/models/mod';

export class ModController extends RedisCache {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const key: string = req.originalUrl;
      const dataCache: any = await RedisCache.client.get(key);
      const page: number = +req.query.page! - 1 || 0;
      const limit: number = +req.query.limit! || 3;
      const listCount: number = +req.query.list_count! || 20;

      if (dataCache != null) {
        return res.json(JSON.parse(dataCache));
      }

      const data = await Mod.aggregate([
        {
          $lookup: {
            from: 'modlist',
            localField: 'id',
            foreignField: 'modId',
            as: 'modListData'
          }
        },
        {
          $unwind: '$modListData' // Giải phóng mảng modListData để thực hiện join tiếp theo
        },
        {
          $lookup: {
            from: 'movies',
            localField: 'modListData.id',
            foreignField: 'id',
            as: 'movie_data'
          }
        },
        {
          $unwind: '$movie_data' // Giải phóng mảng movie_data sau join
        },
        {
          $group: {
            _id: '$_id', // Nhóm lại theo các trường của Mods
            id: { $first: '$id' },
            media_type: { $first: '$media_type' },
            name: { $first: '$name' },
            order: { $first: '$order' },
            data: { $push: '$movie_data' } // Chỉ giữ lại các trường từ Movies
          }
        },
        {
          $sort: { order: 1 }
        },
        {
          $addFields: {
            data: { $slice: ['$data', listCount] }
          }
        },
        {
          $skip: page * limit
        },
        {
          $limit: limit
        }
      ]);

      const total = await Mod.countDocuments({});

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
      return next(error);
    }
  }
}

export default new ModController();
