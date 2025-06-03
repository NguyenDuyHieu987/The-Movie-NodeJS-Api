import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import { v4 as uuidv4 } from 'uuid';

import { RedisCache } from '@/config/redis';
import Mod from '@/models/mod';
import { DeleteResult } from 'mongoose';
import { ModForm } from '@/types';
import { SHORT_DATA_MOVIE_SELECT } from '@/constants';

export class ModController extends RedisCache {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const noCache: boolean = !!req.query?.no_cache;
      const key: string = req.originalUrl;
      const dataCache: any = await RedisCache.client.get(key);

      if (dataCache != null && !noCache) {
        return res.json(JSON.parse(dataCache));
      }

      const data = await Mod.find().sort({
        order: 1
      });

      const response = {
        results: data
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
      const query: string = (req.query.query as string) || '';
      const noCache: boolean = !!req.query?.no_cache;
      const key: string = req.originalUrl;
      const dataCache: any = await RedisCache.client.get(key);

      if (dataCache != null && !noCache) {
        return res.json(JSON.parse(dataCache));
      }

      const data = await Mod.find({
        name: { $regex: query, $options: 'i' }
      }).sort({
        order: 1
      });

      const response = {
        results: data
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

  async getAllWithData(req: Request, res: Response, next: NextFunction) {
    try {
      const key: string = req.originalUrl;
      const dataCache: any = await RedisCache.client.get(key);
      const page: number = +req.query.page! - 1 || 0;
      const limit: number = +req.query.limit! || 3;
      const listCount: number = +req.query.list_count! || 20;

      if (dataCache != null) {
        return res.json(JSON.parse(dataCache));
      }

      const type: string = (req.query?.type as string) || 'all';
      const media_type: string = (req.query?.media_type as string) || 'all';

      const data = await Mod.aggregate([
        {
          $match: {
            $and: [
              media_type !== 'all' ? { media_type: media_type } : {},
              type !== 'all' ? { type: type } : {}
            ]
          }
        },
        {
          $lookup: {
            from: 'modlists',
            localField: 'id',
            foreignField: 'modId',
            as: 'modListData'
          }
        },
        { $unwind: '$modListData' },
        {
          $sort: {
            'modListData.page_tmdb': 1,
            'modListData.updatedAt': -1
          }
        },
        {
          $lookup: {
            from: 'movies',
            localField: 'modListData.id',
            foreignField: 'id',
            as: 'movieData'
          }
        },
        { $unwind: '$movieData' },
        {
          $project: SHORT_DATA_MOVIE_SELECT
        },
        {
          $group: {
            _id: '$_id',
            id: { $first: '$id' },
            media_type: { $first: '$media_type' },
            name: { $first: '$name' },
            type: { $first: '$type' },
            order: { $first: '$order' },
            path: { $first: '$path' },
            data: { $push: '$movieData' }
          }
        },
        { $sort: { order: 1 } },
        {
          $addFields: {
            data: { $slice: ['$data', listCount] }
          }
        },
        { $skip: page * limit },
        { $limit: limit }
      ]).option({ allowDiskUse: true });

      const total = await Mod.countDocuments({
        $and: [
          media_type !== 'all' ? { media_type: media_type } : {},
          type !== 'all' ? { type: type } : {}
        ]
      });

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

  async filterWithData(req: Request, res: Response, next: NextFunction) {
    try {
      const key: string = req.originalUrl;
      const dataCache: any = await RedisCache.client.get(key);
      const page: number = +req.query.page! - 1 || 0;
      const limit: number = +req.query.limit! || 3;
      const listCount: number = +req.query.list_count! || 20;

      if (dataCache != null) {
        return res.json(JSON.parse(dataCache));
      }

      const type: string = (req.params?.type as string) || 'all';

      const sortBy: string = (req.query?.sort_by as string) || '';

      const primaryReleaseDateGte: string =
        (req.query?.primary_release_date_gte as string) || '';

      const primaryReleaseDateLte: string =
        (req.query?.primary_release_date_lte as string) || '';

      const withMods: string = (req.query?.with_genres as string) || '';

      const withOriginalCountry: string =
        (req.query?.with_origin_country as string) || '';

      const convertReleaseDate = (date_gte: string, data_lte: string) => {
        if (date_gte != '' && data_lte != '') {
          return {
            'movieData.release_date': {
              $gte: date_gte,
              $lte: data_lte
            }
          };
        } else if (date_gte == '' && data_lte != '') {
          return {
            'movieData.release_date': {
              $lte: data_lte
            }
          };
        } else if (date_gte != '' && data_lte == '') {
          return {
            'movieData.release_date': {
              $gte: date_gte
            }
          };
        } else return {};
      };

      const convertFirstAirDate = (date_gte: string, data_lte: string) => {
        if (date_gte != '' && data_lte != '') {
          return {
            'movieData.first_air_date': {
              $gte: date_gte,
              $lte: data_lte
            }
          };
        } else if (date_gte == '' && data_lte != '') {
          return {
            'movieData.first_air_date': {
              $lte: data_lte
            }
          };
        } else if (date_gte != '' && data_lte == '') {
          return {
            'movieData.first_air_date': {
              $gte: date_gte
            }
          };
        } else return {};
      };

      const releaseDate = convertReleaseDate(
        primaryReleaseDateGte,
        primaryReleaseDateLte
      );

      const firstAirDate = convertFirstAirDate(
        primaryReleaseDateGte,
        primaryReleaseDateLte
      );

      const convertMods = (genre: string) => {
        if (genre != '') {
          return {
            'movieData.genres': {
              $elemMatch: {
                id: +withMods
              }
            }
          };
        } else return {};
      };

      const genres = convertMods(withMods);

      const convertOriginalCountry = (language: string) => {
        if (language != '') {
          return {
            'movieData.origin_country': { $in: [withOriginalCountry] }
          };
        } else return {};
      };

      const originalLanguage = convertOriginalCountry(withOriginalCountry);

      const response: {
        page: number;
        results: any[];
        page_size: number;
        total: number;
      } = {
        page: page + 1,
        results: [],
        page_size: limit,
        total: 0
      };

      switch (type) {
        case 'all':
          response.results = await Mod.aggregate([
            {
              $lookup: {
                from: 'modlists',
                localField: 'id',
                foreignField: 'modId',
                as: 'modListData'
              }
            },
            {
              $unwind: '$modListData'
            },
            {
              $sort: {
                'modListData.page_tmdb': 1,
                'modListData.updatedAt': -1
              }
            },
            {
              $lookup: {
                from: 'movies',
                localField: 'modListData.id',
                foreignField: 'id',
                as: 'movieData'
              }
            },
            {
              $unwind: '$movieData'
            },
            {
              $project: SHORT_DATA_MOVIE_SELECT
            },
            {
              $match: {
                $or: [
                  { $and: [releaseDate, genres, originalLanguage] },
                  { $and: [firstAirDate, genres, originalLanguage] }
                ]
              }
            },
            {
              $group: {
                _id: '$_id', // Nhóm lại theo các trường của Mods
                id: { $first: '$id' },
                media_type: { $first: '$media_type' },
                name: { $first: '$name' },
                type: { $first: '$type' },
                order: { $first: '$order' },
                path: { $first: '$path' },
                data: { $push: '$movieData' } // Chỉ giữ lại các trường từ Movies
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

          response.total = await Mod.countDocuments({});
          break;
        case 'movie':
          response.results = await Mod.aggregate([
            {
              $lookup: {
                from: 'modlists',
                localField: 'id',
                foreignField: 'modId',
                as: 'modListData'
              }
            },
            {
              $unwind: '$modListData'
            },
            {
              $sort: {
                'modListData.page_tmdb': 1,
                'modListData.updatedAt': -1
              }
            },
            {
              $lookup: {
                from: 'movies',
                localField: 'modListData.id',
                foreignField: 'id',
                as: 'movieData'
              }
            },
            {
              $unwind: '$movieData'
            },
            {
              $unset: [
                'movieData.credits',
                'movieData.videos',
                'movieData.images',
                'movieData.seasons'
              ]
            },
            {
              $match: {
                media_type: type,
                $and: [releaseDate, genres, originalLanguage]
              }
            },
            {
              $group: {
                _id: '$_id', // Nhóm lại theo các trường của Mods
                id: { $first: '$id' },
                media_type: { $first: '$media_type' },
                name: { $first: '$name' },
                type: { $first: '$type' },
                order: { $first: '$order' },
                path: { $first: '$path' },
                data: { $push: '$movieData' } // Chỉ giữ lại các trường từ Movies
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

          response.total = await Mod.countDocuments({
            media_type: type
          });
          break;
        case 'tv':
          response.results = await Mod.aggregate([
            {
              $lookup: {
                from: 'modlists',
                localField: 'id',
                foreignField: 'modId',
                as: 'modListData'
              }
            },
            {
              $unwind: '$modListData'
            },
            {
              $sort: {
                'modListData.page_tmdb': 1,
                'modListData.updatedAt': -1
              }
            },
            {
              $lookup: {
                from: 'movies',
                localField: 'modListData.id',
                foreignField: 'id',
                as: 'movieData'
              }
            },
            {
              $unwind: '$movieData'
            },
            {
              $project: SHORT_DATA_MOVIE_SELECT
            },
            {
              $match: {
                media_type: type,
                $and: [firstAirDate, genres, originalLanguage]
              }
            },
            {
              $group: {
                _id: '$_id', // Nhóm lại theo các trường của Mods
                id: { $first: '$id' },
                media_type: { $first: '$media_type' },
                name: { $first: '$name' },
                type: { $first: '$type' },
                order: { $first: '$order' },
                path: { $first: '$path' },
                data: { $push: '$movieData' } // Chỉ giữ lại các trường từ Movies
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

          response.total = await Mod.countDocuments({
            media_type: type
          });
          break;
        default:
          return next(
            createHttpError.NotFound(
              `Mod with slug: ${req.params.slug} is not found!`
            )
          );
      }

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

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const formData: ModForm = req.body;

      if (!formData) {
        throw createHttpError.InternalServerError(
          'Please provide full mod information'
        );
      }

      const mod = await Mod.findOne({
        $and: [{ type: req.body.type }, { media_type: req.body.media_type }]
      });

      if (mod != null) {
        return res.json({
          success: false,
          message: `Mod already exists`
        });
      }

      const id: string = uuidv4();

      const order: number =
        (await Mod.findOne().sort({ order: -1 }))!.order! + 1;

      const result = await Mod.create({
        id: id,
        ...req.body,
        order: order,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (result == null) {
        throw createHttpError.InternalServerError('Add mod failed');
      }

      return res.json({
        success: true,
        result: result
      });
    } catch (error) {
      return next(error);
    }
  }

  async updateMod(req: Request, res: Response, next: NextFunction) {
    try {
      const formData: ModForm = req.body;

      if (!formData) {
        throw createHttpError.InternalServerError(
          'Please provide full mod information'
        );
      }

      const modId: string = req.params.id;

      const mod = await Mod.findOne({
        $and: [
          { id: { $ne: modId } },
          { type: formData.type },
          { media_type: formData.media_type }
        ]
      });

      if (mod != null) {
        return res.json({
          success: false,
          message: `Mod already exists`
        });
      }

      const result = await Mod.updateOne(
        {
          id: modId
        },
        {
          $set: {
            name: formData.name,
            media_type: formData.media_type,
            type: formData.type,
            path: formData.path,
            order: formData.order,
            updated_at: new Date().toISOString()
          }
        }
      );

      if (result.modifiedCount != 1) {
        return next(createHttpError.InternalServerError('Update mod failed'));
      }

      return res.json({
        success: true,
        result: result
      });
    } catch (error) {
      return next(error);
    }
  }

  async deleteMod(req: Request, res: Response, next: NextFunction) {
    try {
      const modId: string = req.params.id;

      const result = await Mod.deleteOne({
        id: modId
      });

      if (result.deletedCount != 1) {
        return next(createHttpError.InternalServerError('Delete mod failed'));
      }

      return res.json({
        success: true,
        message: 'Delete mod suucessfully'
      });
    } catch (error) {
      return next(error);
    }
  }

  async deleteModMultiple(req: Request, res: Response, next: NextFunction) {
    try {
      const listModId: string[] | number[] = req.body.listModId;
      var results: DeleteResult[] = [];
      for (var modId of listModId) {
        const result = await Mod.deleteOne({
          id: modId
        });
        results.push(result);
      }

      if (results.some((r) => !r.acknowledged)) {
        return next(createHttpError.InternalServerError('Delete mods failed'));
      }

      return res.json({
        success: true,
        message: 'Delete mods suucessfully'
      });
    } catch (error) {
      return next(error);
    }
  }
}

export default new ModController();
