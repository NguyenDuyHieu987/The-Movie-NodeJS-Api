import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';

import { RedisCache } from '@/config/redis';
import ModList from '@/models/modList';
import { ModListForm } from '@/types';
import { DeleteResult } from 'mongoose';

export class ModListController extends RedisCache {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const noCache: boolean = !!req.query?.no_cache;
      const key: string = req.originalUrl;
      const page: number = +req.query.page! - 1 || 0;
      const limit: number = +req.query.limit! || 20;
      const dataCache: any = await RedisCache.client.get(key);
      const type: string = (req.query.type as string) || 'all';

      if (dataCache != null && !noCache) {
        return res.json(JSON.parse(dataCache));
      }

      let optionSearch: any[] = [];

      if (type != 'all') {
        optionSearch = [
          {
            $match: {
              'modData.type': type
            }
          }
        ];
      }

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

      if (limit != -1) {
        response.results = await ModList.aggregate([
          {
            $lookup: {
              from: 'mods',
              localField: 'modId',
              foreignField: 'id',
              as: 'modData'
            }
          },
          {
            $unwind: '$modData'
          },
          {
            $lookup: {
              from: 'movies',
              localField: 'id',
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
          ...optionSearch
        ])
          .skip(page * limit)
          .limit(limit);
      } else {
        response.results = await ModList.aggregate([
          {
            $lookup: {
              from: 'mods',
              localField: 'modId',
              foreignField: 'id',
              as: 'modData'
            }
          },
          {
            $unwind: '$modData'
          },
          {
            $lookup: {
              from: 'movies',
              localField: 'id',
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
          ...optionSearch
        ]);
      }

      response.total = (
        await ModList.aggregate([
          {
            $lookup: {
              from: 'mods',
              localField: 'modId',
              foreignField: 'id',
              as: 'modData'
            }
          },
          {
            $unwind: '$modData'
          },
          {
            $lookup: {
              from: 'movies',
              localField: 'id',
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
          ...optionSearch
        ])
      ).length;

      if (response.results.length > 0 && !noCache) {
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
      const page: number = +req.query.page! - 1 || 0;
      const limit: number = +req.query.limit! || 20;
      const dataCache: any = await RedisCache.client.get(key);
      const type: string = (req.query.type as string) || 'all';

      if (dataCache != null && !noCache) {
        return res.json(JSON.parse(dataCache));
      }

      let optionSearch: any = {};

      if (type != 'all') {
        optionSearch['modData.type'] = type;
      }

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
      if (limit != -1) {
        response.results = await ModList.aggregate([
          {
            $lookup: {
              from: 'mods',
              localField: 'modId',
              foreignField: 'id',
              as: 'modData'
            }
          },
          {
            $unwind: '$modData'
          },
          {
            $lookup: {
              from: 'movies',
              localField: 'id',
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
              ...optionSearch,
              $or: [
                { 'movieData.name': { $regex: query, $options: 'i' } },
                { 'movieData.original_name': { $regex: query, $options: 'i' } }
              ]
            }
          }
        ])
          .skip(page * limit)
          .limit(limit);
      } else {
        response.results = await ModList.aggregate([
          {
            $lookup: {
              from: 'mods',
              localField: 'modId',
              foreignField: 'id',
              as: 'modData'
            }
          },
          {
            $unwind: '$modData'
          },
          {
            $lookup: {
              from: 'movies',
              localField: 'id',
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
              ...optionSearch,
              $or: [
                { 'movieData.name': { $regex: query, $options: 'i' } },
                { 'movieData.original_name': { $regex: query, $options: 'i' } }
              ]
            }
          }
        ]);
      }

      response.total = (
        await ModList.aggregate([
          {
            $lookup: {
              from: 'mods',
              localField: 'modId',
              foreignField: 'id',
              as: 'modData'
            }
          },
          {
            $unwind: '$modData'
          },
          {
            $lookup: {
              from: 'movies',
              localField: 'id',
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
              ...optionSearch,
              $or: [
                { 'movieData.name': { $regex: query, $options: 'i' } },
                { 'movieData.original_name': { $regex: query, $options: 'i' } }
              ]
            }
          }
        ])
      ).length;

      if (response.results.length > 0 && !noCache) {
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

  async filter(req: Request, res: Response, next: NextFunction) {
    try {
      const key: string = req.originalUrl;
      const dataCache: any = await RedisCache.client.get(key);
      const page: number = +req.query.page! - 1 || 0;
      const limit: number = +req.query.limit! || 20;

      if (dataCache != null) {
        return res.json(JSON.parse(dataCache));
      }

      const type: string = req.params.type as string;

      const slug: string = req.params.slug as string;

      const sortBy: string = (req.query?.sort_by as string) || '';

      const primaryReleaseDateGte: string =
        (req.query?.primary_release_date_gte as string) || '';

      const primaryReleaseDateLte: string =
        (req.query?.primary_release_date_lte as string) || '';

      const withGenres: string = (req.query?.with_genres as string) || '';

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

      const convertOriginalCountry = (language: string) => {
        if (language != '') {
          return {
            'movieData.origin_country': { $in: [withOriginalCountry] }
          };
          // return {
          //   'movieData.origin_country': {
          //     $elemMatch: { $regex: withOriginalCountry, $options: 'i' }
          //   }
          // };
        } else return {};
      };

      const originalCountry = convertOriginalCountry(withOriginalCountry);

      const result: {
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

      const replaceRoot = {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              {
                modData: '$modData'
              },
              '$movieData'
            ]
          }
        }
      };

      switch (type) {
        case 'all':
          const options = [
            {
              $lookup: {
                from: 'mods',
                localField: 'modId',
                foreignField: 'id',
                as: 'modData'
              }
            },
            {
              $unwind: '$modData'
            },
            {
              $lookup: {
                from: 'movies',
                localField: 'id',
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
                'modData.type': slug,
                $or: [
                  { $and: [releaseDate, genres, originalCountry] },
                  { $and: [firstAirDate, genres, originalCountry] }
                ]
              }
            }
          ];

          switch (sortBy) {
            case 'views_desc':
              result.results = await ModList.aggregate([
                ...options,
                replaceRoot,
                {
                  $skip: page * limit
                },
                {
                  $limit: limit
                },
                {
                  $sort: { views: -1 }
                }
              ]);
              break;
            case 'release_date_desc':
              result.results = await ModList.aggregate([
                ...options,
                replaceRoot,
                {
                  $skip: page * limit
                },
                {
                  $limit: limit
                },
                {
                  $sort: { release_date: -1 }
                }
              ]);
              break;
            case 'revenue_desc':
              result.results = await ModList.aggregate([
                ...options,
                replaceRoot,
                {
                  $skip: page * limit
                },
                {
                  $limit: limit
                },
                {
                  $sort: { revenue: -1 }
                }
              ]);
              break;
            case 'vote_average_desc':
              result.results = await ModList.aggregate([
                ...options,
                replaceRoot,
                {
                  $skip: page * limit
                },
                {
                  $limit: limit
                },
                {
                  $sort: { vote_average: -1 }
                }
              ]);
              break;
            case 'vote_count_desc':
              result.results = await ModList.aggregate([
                ...options,
                replaceRoot,
                {
                  $skip: page * limit
                },
                {
                  $limit: limit
                },
                {
                  $sort: { vote_count: -1 }
                }
              ]);

              break;
            case '':
              result.results = await ModList.aggregate([
                ...options,
                replaceRoot,
                {
                  $skip: page * limit
                },
                {
                  $limit: limit
                }
              ]);
              break;
            default:
              return next(
                createHttpError.NotFound(
                  `Filter modlist with sort by: ${sortBy} is not found!`
                )
              );
          }

          const total: any[] = await ModList.aggregate([
            ...options,
            {
              $count: 'totalCount'
            }
          ]);

          result.total = total[0].totalCount;
          break;
        case 'movie':
          const optionsMovie = [
            {
              $lookup: {
                from: 'mods',
                localField: 'modId',
                foreignField: 'id',
                as: 'modData'
              }
            },
            {
              $unwind: '$modData'
            },
            {
              $match: {
                'modData.type': slug
              }
            },
            // {
            //   $lookup: {
            //     from: 'movies',
            //     localField: 'id',
            //     foreignField: 'id',
            //     as: 'movieData'
            //   }
            // },
            {
              $lookup: {
                from: 'movies',
                localField: 'id',
                foreignField: 'id',
                pipeline: [
                  {
                    $match: {
                      media_type: type,
                      $and: [releaseDate, genres, originalCountry]
                    }
                  }
                ],
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
            }
            // {
            //   $match: {
            //     'modData.type': slug,
            //     'movieData.media_type': type,
            //     $and: [releaseDate, genres, originalCountry]
            //   }
            // }
          ];
          switch (sortBy) {
            case 'views_desc':
              result.results = await ModList.aggregate([
                ...optionsMovie,
                replaceRoot,
                {
                  $skip: page * limit
                },
                {
                  $limit: limit
                },
                {
                  $sort: { views: -1 }
                }
              ]);
              break;
            case 'release_date_desc':
              result.results = await ModList.aggregate([
                ...optionsMovie,
                replaceRoot,
                {
                  $skip: page * limit
                },
                {
                  $limit: limit
                },
                {
                  $sort: { release_date: -1 }
                }
              ]);
              break;
            case 'revenue_desc':
              result.results = await ModList.aggregate([
                ...optionsMovie,
                replaceRoot,
                {
                  $skip: page * limit
                },
                {
                  $limit: limit
                },
                {
                  $sort: { revenue: -1 }
                }
              ]);
              break;
            case 'vote_average_desc':
              result.results = await ModList.aggregate([
                ...optionsMovie,
                replaceRoot,
                {
                  $skip: page * limit
                },
                {
                  $limit: limit
                },
                {
                  $sort: { vote_average: -1 }
                }
              ]);
              break;
            case 'vote_count_desc':
              result.results = await ModList.aggregate([
                ...optionsMovie,
                replaceRoot,
                {
                  $skip: page * limit
                },
                {
                  $limit: limit
                },
                {
                  $sort: { vote_count: -1 }
                }
              ]);

              break;
            case '':
              result.results = await ModList.aggregate([
                ...optionsMovie,
                replaceRoot,
                {
                  $skip: page * limit
                },
                {
                  $limit: limit
                }
              ]);
              // .explain('executionStats');

              // console.log(result.results);
              break;
            default:
              return next(
                createHttpError.NotFound(
                  `Filter modlist with sort by: ${sortBy} is not found!`
                )
              );
          }

          // const totalMovie: any[] = await ModList.aggregate([
          //   ...optionsMovie,
          //   {
          //     $count: 'totalCount'
          //   }
          // ]);

          // result.total = totalMovie[0].totalCount;
          break;
        case 'tv':
          const optionsTV = [
            {
              $lookup: {
                from: 'mods',
                localField: 'modId',
                foreignField: 'id',
                as: 'modData'
              }
            },
            {
              $unwind: '$modData'
            },
            {
              $lookup: {
                from: 'movies',
                localField: 'id',
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
                'modData.type': slug,
                'movieData.media_type': type,
                $and: [firstAirDate, genres, originalCountry]
              }
            }
          ];
          switch (sortBy) {
            case 'views_desc':
              result.results = await ModList.aggregate([
                ...optionsTV,
                replaceRoot,
                {
                  $skip: page * limit
                },
                {
                  $limit: limit
                },
                {
                  $sort: { views: -1 }
                }
              ]);
              break;
            case 'release_date_desc':
              result.results = await ModList.aggregate([
                ...optionsTV,
                replaceRoot,
                {
                  $skip: page * limit
                },
                {
                  $limit: limit
                },
                {
                  $sort: { release_date: -1 }
                }
              ]);
              break;
            case 'revenue_desc':
              result.results = await ModList.aggregate([
                ...optionsTV,
                replaceRoot,
                {
                  $skip: page * limit
                },
                {
                  $limit: limit
                },
                {
                  $sort: { revenue: -1 }
                }
              ]);
              break;
            case 'vote_average_desc':
              result.results = await ModList.aggregate([
                ...optionsTV,
                replaceRoot,
                {
                  $skip: page * limit
                },
                {
                  $limit: limit
                },
                {
                  $sort: { vote_average: -1 }
                }
              ]);
              break;
            case 'vote_count_desc':
              result.results = await ModList.aggregate([
                ...optionsTV,
                replaceRoot,
                {
                  $skip: page * limit
                },
                {
                  $limit: limit
                },
                {
                  $sort: { vote_count: -1 }
                }
              ]);

              break;
            case '':
              result.results = await ModList.aggregate([
                ...optionsTV,
                replaceRoot,
                {
                  $skip: page * limit
                },
                {
                  $limit: limit
                }
              ]);
              break;
            default:
              return next(
                createHttpError.NotFound(
                  `Filter modlist with sort by: ${sortBy} is not found!`
                )
              );
          }

          const totalTV: any[] = await ModList.aggregate([
            ...optionsTV,
            {
              $count: 'totalCount'
            }
          ]);

          result.total = totalTV[0].totalCount;
          break;
        default:
          return next(
            createHttpError.NotFound(
              `Modlist with slug: ${req.params.slug} is not found!`
            )
          );
      }

      await RedisCache.client.setEx(
        key,
        +process.env.REDIS_CACHE_TIME!,
        JSON.stringify(result)
      );

      return res.json(result);
    } catch (error) {
      return next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const formData: ModListForm = req.body;

      if (!formData) {
        throw createHttpError.InternalServerError(
          'Please provide full modList information'
        );
      }

      const listMovieId: string[] | number[] = formData.listMovieId;
      var results: any[] = [];

      for (var movieId of listMovieId) {
        const result = await ModList.create({
          id: movieId,
          modId: formData.modId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        results.push(result);
      }

      if (results.some((r) => r == null)) {
        throw createHttpError.InternalServerError('Add modList failed');
      }

      return res.json({
        success: true,
        results: results
      });
    } catch (error) {
      return next(error);
    }
  }

  async updateModList(req: Request, res: Response, next: NextFunction) {
    try {
      const formData: ModListForm = req.body;

      if (!formData) {
        throw createHttpError.InternalServerError(
          'Please provide full modList information'
        );
      }

      const modListId: string = req.params.id;

      const result = await ModList.updateOne(
        {
          _id: modListId
        },
        {
          $set: {
            id: formData.listMovieId[0] || formData.id,
            modId: formData.modId,
            updated_at: new Date().toISOString()
          }
        }
      );

      if (result.modifiedCount != 1) {
        return next(
          createHttpError.InternalServerError('Update modList failed')
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

  async deleteModList(req: Request, res: Response, next: NextFunction) {
    try {
      const modListId: string = req.params.id;

      const result = await ModList.deleteOne({
        _id: modListId
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

  async deleteModListMultiple(req: Request, res: Response, next: NextFunction) {
    try {
      const listModListId: string[] | number[] = req.body.listModListId;
      var results: DeleteResult[] = [];
      for (var modListId of listModListId) {
        const result = await ModList.deleteOne({
          _id: modListId
        });
        results.push(result);
      }

      if (results.some((r) => !r.acknowledged)) {
        return next(
          createHttpError.InternalServerError('Delete modLists failed')
        );
      }

      return res.json({
        success: true,
        message: 'Delete modLists suucessfully'
      });
    } catch (error) {
      return next(error);
    }
  }
}

export default new ModListController();
