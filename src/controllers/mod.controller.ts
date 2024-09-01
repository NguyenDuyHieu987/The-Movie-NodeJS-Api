import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';

import { RedisCache } from '@/config/redis';
import Mod from '@/models/mod';

export class ModController extends RedisCache {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const key: string = req.originalUrl;
      const dataCache: any = await RedisCache.client.get(key);

      if (dataCache != null) {
        return res.json(JSON.parse(dataCache));
      }

      const data = await Mod.find().sort({
        order: 1
      });

      const response = {
        results: data
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

      const data = await Mod.aggregate([
        {
          $match:
            type != 'all'
              ? {
                  media_type: type
                }
              : {}
        },
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

      const total = await Mod.countDocuments(
        type != 'all'
          ? {
              media_type: type
            }
          : {}
      );

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

  async filteWithData(req: Request, res: Response, next: NextFunction) {
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

      const withGenres: string = (req.query?.with_genres as string) || '';

      const withOriginalLanguage: string =
        (req.query?.with_original_language as string) || '';

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

      const convertGenres = (genre: string) => {
        if (genre != '') {
          return {
            'movieData.genres': {
              $elemMatch: {
                id: +withGenres
              }
            }
          };
        } else return {};
      };

      const genres = convertGenres(withGenres);

      const convertOriginalLanguage = (language: string) => {
        if (language != '') {
          return {
            'movieData.original_language': { $regex: withOriginalLanguage }
          };
        } else return {};
      };

      const originalLanguage = convertOriginalLanguage(withOriginalLanguage);

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
}

export default new ModController();
