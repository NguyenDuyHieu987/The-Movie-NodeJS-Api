import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';

import { RedisCache } from '@/config/redis';
import ModList from '@/models/modList';

export class ModListController extends RedisCache {
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

      const withOriginalLanguage: string =
        (req.query?.with_original_language as string) || '';

      const convertReleaseDate = (date_gte: string, data_lte: string) => {
        if (date_gte != '' && data_lte != '') {
          return {
            release_date: {
              $gte: date_gte,
              $lte: data_lte
            }
          };
        } else if (date_gte == '' && data_lte != '') {
          return {
            release_date: {
              $lte: data_lte
            }
          };
        } else if (date_gte != '' && data_lte == '') {
          return {
            release_date: {
              $gte: date_gte
            }
          };
        } else return {};
      };

      const convertFirstAirDate = (date_gte: string, data_lte: string) => {
        if (date_gte != '' && data_lte != '') {
          return {
            first_air_date: {
              $gte: date_gte,
              $lte: data_lte
            }
          };
        } else if (date_gte == '' && data_lte != '') {
          return {
            first_air_date: {
              $lte: data_lte
            }
          };
        } else if (date_gte != '' && data_lte == '') {
          return {
            first_air_date: {
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
            genres: {
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
          return { original_language: { $regex: withOriginalLanguage } };
        } else return {};
      };

      const originalLanguage = convertOriginalLanguage(withOriginalLanguage);

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
              $match: {
                'modData.type': slug,
                $or: [
                  { $and: [releaseDate, genres, originalLanguage] },
                  { $and: [firstAirDate, genres, originalLanguage] }
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
              $match: {
                'modData.type': slug,
                'movieData.media_type': type,
                $and: [releaseDate, genres, originalLanguage]
              }
            }
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
              break;
            default:
              return next(
                createHttpError.NotFound(
                  `Filter modlist with sort by: ${sortBy} is not found!`
                )
              );
          }

          const totalMovie: any[] = await ModList.aggregate([
            ...optionsMovie,
            {
              $count: 'totalCount'
            }
          ]);

          result.total = totalMovie[0].totalCount;
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
              $match: {
                'modData.type': slug,
                'movieData.media_type': type,
                $and: [firstAirDate, genres, originalLanguage]
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
}

export default new ModListController();
