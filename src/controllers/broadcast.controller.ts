import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';

import { RedisCache } from '@/config/redis';
import Broadcast from '@/models/broadcast';
import { BroadcastForm } from '@/types';
import { DeleteResult } from 'mongoose';

export class BroadcastController extends RedisCache {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const noCache: boolean = !!req.query?.no_cache;
      const key: string = req.originalUrl;
      const page: number = +req.query.page! - 1 || 0;
      const limit: number = +req.query.limit! || 20;
      const dataCache: any = await RedisCache.client.get(key);

      if (dataCache != null && !noCache) {
        return res.json(JSON.parse(dataCache));
      }

      const aggregateOptions =
        limit != -1
          ? [
              {
                $skip: page * limit
              },
              {
                $limit: limit
              }
            ]
          : [];

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
          $lookup: {
            from: 'episodes',
            let: {
              episodeId: '$episode_id',
              mediaType: '$movieData.media_type'
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$id', '$$episodeId'] },
                      { $eq: ['$$mediaType', 'tv'] }
                    ]
                  }
                }
              }
            ],
            as: 'episodeData'
          }
        },
        {
          $unwind: {
            path: '$episodeData',
            preserveNullAndEmptyArrays: true // Giữ nguyên nếu không có dữ liệu trong episodeData
          }
        },
        ...aggregateOptions
      ]);

      const total = (
        await Broadcast.aggregate([
          {
            $lookup: {
              from: 'movies',
              localField: 'movie_id',
              foreignField: 'id',
              as: 'movieData'
            }
          }
        ])
      ).length;

      const response = {
        page: page + 1,
        page_size: limit,
        results: data,
        total
      };

      if (data.length > 0 && !noCache) {
        await RedisCache.client.setEx(
          key,
          +process.env.REDIS_CACHE_TIME!,
          JSON.stringify(response)
        );
      }

      return res.json(response);
    } catch (error) {
      return next(error);
    }
  }

  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const noCache: boolean = !!req.query?.no_cache;
      const key: string = req.originalUrl;
      const page: number = +req.query.page! - 1 || 0;
      const limit: number = +req.query.limit! || 20;
      const query: string = (req.query.query as string) || '';
      const dataCache: any = await RedisCache.client.get(key);

      if (dataCache != null && !noCache) {
        return res.json(JSON.parse(dataCache));
      }

      const aggregateOptions =
        limit != -1
          ? [
              {
                $skip: page * limit
              },
              {
                $limit: limit
              }
            ]
          : [];

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
          $lookup: {
            from: 'episodes',
            let: {
              episodeId: '$episode_id',
              mediaType: '$movieData.media_type'
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$id', '$$episodeId'] },
                      { $eq: ['$$mediaType', 'tv'] }
                    ]
                  }
                }
              }
            ],
            as: 'episodeData'
          }
        },
        {
          $unwind: {
            path: '$episodeData',
            preserveNullAndEmptyArrays: true // Giữ nguyên nếu không có dữ liệu trong episodeData
          }
        },
        {
          $match: {
            $or: [
              { name: { $regex: query, $options: 'i' } },
              { 'movieData.name': { $regex: query, $options: 'i' } },
              { 'movieData.original_name': { $regex: query, $options: 'i' } }
            ]
          }
        },
        ...aggregateOptions
      ]);

      const total = (
        await Broadcast.aggregate([
          {
            $lookup: {
              from: 'movies',
              localField: 'movie_id',
              foreignField: 'id',
              as: 'movieData'
            }
          },
          {
            $lookup: {
              from: 'episodes',
              let: {
                episodeId: '$episode_id',
                mediaType: '$movieData.media_type'
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ['$id', '$$episodeId'] },
                        { $eq: ['$$mediaType', 'tv'] }
                      ]
                    }
                  }
                }
              ],
              as: 'episodeData'
            }
          },
          {
            $unwind: {
              path: '$episodeData',
              preserveNullAndEmptyArrays: true // Giữ nguyên nếu không có dữ liệu trong episodeData
            }
          },
          {
            $match: {
              $or: [
                { name: { $regex: query, $options: 'i' } },
                { 'movieData.name': { $regex: query, $options: 'i' } },
                { 'movieData.original_name': { $regex: query, $options: 'i' } }
              ]
            }
          }
        ])
      ).length;

      const response = {
        page: page + 1,
        page_size: limit,
        results: data,
        total
      };

      if (data.length > 0 && !noCache) {
        await RedisCache.client.setEx(
          key,
          +process.env.REDIS_CACHE_TIME!,
          JSON.stringify(response)
        );
      }

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
            // Kiểm tra nếu có trường episode_id
            hasEpisodeId: { $ne: ['$episode_id', null] }
          }
        },
        {
          $lookup: {
            from: 'episodes',
            let: { episodeId: '$episode_id' },
            pipeline: [
              { $match: { $expr: { $eq: ['$id', '$$episodeId'] } } },
              { $project: { runtime: 1 } }
            ],
            as: 'episodeData'
          }
        },
        {
          $addFields: {
            // Nếu có episode_id và media_type là 'tv', dùng runtime từ episodes
            adjusted_runtime: {
              $cond: {
                if: {
                  $and: [
                    { $eq: ['$movieData.media_type', 'tv'] },
                    { $eq: ['$hasEpisodeId', true] }
                  ]
                },
                then: { $arrayElemAt: ['$episodeData.runtime', 0] }, // Lấy runtime từ episodeData
                else: '$movieData.runtime' // Nếu không, lấy runtime từ movieData
              }
            }
          }
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
            // Chuyển adjusted_runtime sang kiểu Number nếu nó là kiểu string
            movie_runtime_in_ms: {
              $cond: {
                if: { $eq: [{ $type: '$adjusted_runtime' }, 'string'] },
                then: { $multiply: [{ $toDouble: '$adjusted_runtime' }, 1000] }, // Chuyển thành số và nhân với 1000
                else: { $multiply: ['$adjusted_runtime', 1000] } // Nhân với 1000 nếu đã là số
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
        },
        {
          $lookup: {
            from: 'episodes',
            let: {
              episodeId: '$episode_id',
              mediaType: '$movieData.media_type'
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$id', '$$episodeId'] },
                      { $eq: ['$$mediaType', 'tv'] }
                    ]
                  }
                }
              }
            ],
            as: 'episodeData'
          }
        },
        {
          $unwind: {
            path: '$episodeData',
            preserveNullAndEmptyArrays: true // Giữ nguyên nếu không có dữ liệu trong episodeData
          }
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

  async Interact(req: Request, res: Response, next: NextFunction) {
    try {
      const broadcastId: string = req.params.id;

      const broadcast = await Broadcast.updateOne(
        { id: broadcastId },
        {
          $inc: { number_of_interactions: 1 }
        }
      );

      if (broadcast.modifiedCount != 1) {
        return res.json({
          success: false,
          result: 'Interact broadcast failed'
        });
      }

      return res.json({
        success: true,
        result: 'Interact broadcast successfully'
      });
    } catch (error) {
      return next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const formData: BroadcastForm = req.body;

      if (!formData) {
        throw createHttpError.InternalServerError(
          'Please provide full genre information'
        );
      }

      const result = await Broadcast.create({
        ...req.body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (result == null) {
        throw createHttpError.InternalServerError('Add genre failed');
      }

      return res.json({
        success: true,
        result: result
      });
    } catch (error) {
      return next(error);
    }
  }

  async updateBroadcast(req: Request, res: Response, next: NextFunction) {
    try {
      const formData: BroadcastForm = req.body;

      if (!formData) {
        throw createHttpError.InternalServerError(
          'Please provide full broadcast information'
        );
      }

      const broadcastId: string = req.params.id;

      const updateObj: any = {
        movie_id: formData.movie_id,
        name: formData.name,
        description: formData.description,
        release_time: formData.release_time,
        updated_at: new Date().toISOString()
      };

      if (formData?.episode_id) {
        updateObj.episode_id = formData.episode_id;
      }

      const result = await Broadcast.updateOne(
        {
          id: broadcastId
        },
        {
          $set: updateObj
        }
      );

      if (result.modifiedCount != 1) {
        return next(
          createHttpError.InternalServerError('Update broadcast failed')
        );
      }

      return res.json({
        success: true,
        result: result
      });
    } catch (error) {
      return next(error);
    }
  }

  async deleteBroadcast(req: Request, res: Response, next: NextFunction) {
    try {
      const broadcastId: string = req.params.id;

      const result = await Broadcast.deleteOne({
        id: broadcastId
      });

      if (result.deletedCount != 1) {
        return next(
          createHttpError.InternalServerError('Delete broadcast failed')
        );
      }

      return res.json({
        success: true,
        message: 'Delete broadcast suucessfully'
      });
    } catch (error) {
      return next(error);
    }
  }

  async deleteBroadcastMultiple(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const listBroadcastId: string[] | number[] = req.body.listBroadcastId;
      var results: DeleteResult[] = [];
      for (var broadcastId of listBroadcastId) {
        const result = await Broadcast.deleteOne({
          id: broadcastId
        });
        results.push(result);
      }

      if (results.some((r) => !r.acknowledged)) {
        return next(
          createHttpError.InternalServerError('Delete broadcasts failed')
        );
      }

      return res.json({
        success: true,
        message: 'Delete broadcasts suucessfully'
      });
    } catch (error) {
      return next(error);
    }
  }
}

export default new BroadcastController();
