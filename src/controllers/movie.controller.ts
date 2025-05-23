import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import { v4 as uuidv4 } from 'uuid';

import Credit from '@/models/credit';
import History from '@/models/history';
import Image from '@/models/image';
import List from '@/models/list';
import Movie, { MovieTest } from '@/models/movie';
import Rate from '@/models/rate';
import Video from '@/models/video';
import { RedisCache } from '@/config/redis';
import type { MovieForm, TCredit, TImage, User } from '@/types';
import { DeleteResult } from 'mongoose';

export class MovieController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const noCache: boolean = !!req.query?.no_cache;
      const page: number = +req.query.page! - 1 || 0;
      const limit: number = +req.query.limit! || 20;
      const key: string = req.originalUrl;
      const dataCache: any = await RedisCache.client.get(key);

      if (dataCache != null && !noCache) {
        return res.json(JSON.parse(dataCache));
      }
      const media_type: string = (req.query.media_type as string) || 'all';

      let data: any[] = [];
      let total: number = 0;
      let optionSearch: any = {};

      if (media_type != 'all') {
        optionSearch.media_type = media_type;
      }

      if (limit != -1) {
        data = await Movie.find(optionSearch)
          .skip(page * limit)
          .limit(limit);
      } else {
        data = await Movie.find(optionSearch);
      }

      total = await Movie.countDocuments(optionSearch);

      const response = {
        page: page + 1,
        results: data,
        total,
        page_size: limit
      };

      if (!noCache) {
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
      const dataCache: any = await RedisCache.client.get(key);

      const query: string = (req.query.query as string) || '';
      const page: number = +req.query.page! - 1 || 0;
      const limit: number = +req.query.limit! || 20;

      if (dataCache != null && !noCache) {
        return res.json(JSON.parse(dataCache));
      }

      const media_type: string = (req.query.media_type as string) || 'all';
      let optionSearch: any = {};

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

      if (media_type != 'all') {
        optionSearch.media_type = media_type;
      }

      if (limit != -1) {
        result.results = await Movie.find({
          ...optionSearch,
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { original_name: { $regex: query, $options: 'i' } }
          ]
        })
          .skip(page * limit)
          .limit(limit);
      } else {
        result.results = await Movie.find({
          ...optionSearch,
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { original_name: { $regex: query, $options: 'i' } }
          ]
        });
      }

      result.total = await Movie.countDocuments({
        ...optionSearch,
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { original_name: { $regex: query, $options: 'i' } }
        ]
      });

      if (!noCache) {
        await RedisCache.client.setEx(
          key,
          +process.env.REDIS_CACHE_TIME!,
          JSON.stringify(result)
        );
      }

      return res.json(result);
    } catch (error) {
      return next(error);
    }
  }

  async detail_old(req: Request, res: Response, next: NextFunction) {
    try {
      let append_to_response: string[] | null = null;
      const extraValue: {
        // images?: TImage;
        // videos?: object[];
        // credits?: TCredit;
        images?: any[];
        videos?: any[];
        credits?: any[];
      } = {
        images: [],
        videos: [],
        credits: []
      };

      if (req.query?.append_to_response) {
        append_to_response = (req.query.append_to_response as string).split(
          ','
        );

        if (append_to_response.includes('images')) {
          // const images = await Image.findOne({
          //   movie_id: req.params.id,
          // });

          // extraValue!.images = images!.items;

          extraValue.images = [
            {
              $lookup: {
                from: 'images',
                localField: 'id',
                foreignField: 'movie_id',
                as: 'images'
              }
            },
            { $unwind: '$images' },
            {
              $addFields: {
                images: '$images.items'
              }
            }
          ];
        }

        if (append_to_response.includes('videos')) {
          // const videos = await Video.findOne({
          //   movie_id: req.params.id,
          // });

          // extraValue!.videos = videos!.items;

          extraValue.videos = [
            {
              $lookup: {
                from: 'videos',
                localField: 'id',
                foreignField: 'movie_id',
                as: 'videos'
              }
            },
            { $unwind: '$videos' },
            {
              $addFields: {
                videos: '$videos.items'
              }
            }
          ];
        }

        if (append_to_response.includes('credits')) {
          // const credits = await Credit.findOne({
          //   movie_id: req.params.id,
          // });

          // extraValue!.credits = credits!.items;

          extraValue.credits = [
            {
              $lookup: {
                from: 'credits',
                localField: 'id',
                foreignField: 'movie_id',
                as: 'credits'
              }
            },
            { $unwind: '$credits' },
            {
              $addFields: {
                credits: '$credits.items'
              }
            }
          ];
        }
      }

      const extraValue2: {
        list: any[];
        history: any[];
        rate: any[];
      } = {
        list: [],
        history: [],
        rate: []
      };

      if (
        req.headers?.authorization ||
        req.cookies?.user_token ||
        res.locals.user
      ) {
        const userToken = res.locals.userToken;
        const user = res.locals.user as User;

        // const item_list = await List.findOne({
        //   user_id: user.id,
        //   movie_id: req.params.id,
        //   media_type: 'movie',
        // });

        // if (item_list != null) {
        //   extraValue2 = {
        //     ...extraValue2,
        //     in_list: item_list != null,
        //   };
        // }

        extraValue2.list = [
          {
            $lookup: {
              from: 'lists',
              localField: 'id',
              foreignField: 'movie_id',
              pipeline: [
                {
                  $match: {
                    $and: [
                      { $expr: { $eq: ['$media_type', 'movie'] } },
                      { $expr: { $eq: ['$user_id', user.id] } }
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
          }
        ];

        // const item_history = await History.findOne({
        //   user_id: user.id,
        //   movie_id: req.params.id,
        //   media_type: 'movie',
        // });

        // if (item_history != null) {
        //   extraValue2 = {
        //     ...extraValue2,
        //     history_progress: {
        //       duration: item_history.duration,
        //       percent: item_history.percent,
        //       seconds: item_history.seconds,
        //     },
        //   };
        // }

        extraValue2.history = [
          {
            $lookup: {
              from: 'histories',
              localField: 'id',
              foreignField: 'movie_id',
              pipeline: [
                {
                  $match: {
                    $and: [
                      { $expr: { $eq: ['$media_type', 'movie'] } },
                      { $expr: { $eq: ['$user_id', user.id] } }
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

        // const item_rate = await Rate.findOne({
        //   user_id: user.id,
        //   movie_id: req.params.id,
        //   movie_type: 'movie',
        // });

        // if (item_rate != null) {
        //   extraValue2 = {
        //     ...extraValue2,
        //     rated_value: item_rate.rate_value,
        //   };
        // }

        extraValue2.rate = [
          {
            $lookup: {
              from: 'rates',
              localField: 'id',
              foreignField: 'movie_id',
              pipeline: [
                {
                  $match: {
                    $and: [
                      { $expr: { $eq: ['$movie_type', 'movie'] } },
                      { $expr: { $eq: ['$user_id', user.id] } }
                    ]
                  }
                }
              ],
              as: 'rated_value'
            }
          },
          {
            $unwind: {
              path: '$rated_value',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $addFields: {
              rated_value: '$rated_value.rate_value'
            }
          }
        ];

        // return res.json({
        //   ...data[0],
        //   // ...extraValue,
        //   ...extraValue2,
        // });
      }

      const data = await Movie.aggregate([
        {
          $match: { id: req.params.id, media_type: req.params.type }
        },
        ...extraValue.images!,
        ...extraValue.videos!,
        ...extraValue.credits!,
        ...extraValue2.list,
        ...extraValue2.history,
        ...extraValue2.rate
      ]);

      if (data.length == 0) {
        return next(
          createHttpError.NotFound(
            `Movie with id: ${req.params.id} is not found`
          )
        );
      }

      return res.json({
        ...data[0]
        // ...extraValue
      });
    } catch (error) {
      return next(error);
    }
  }

  async detail(req: Request, res: Response, next: NextFunction) {
    try {
      let append_to_response: string[] = [];
      const extraValue: {
        episodes?: any[];
      } = {
        episodes: []
      };

      let fieldsToUnset = [];
      append_to_response = (
        (req.query?.append_to_response as string) || ''
      ).split(',');

      if (!append_to_response.includes('images')) {
        fieldsToUnset.push('images');
      }

      if (!append_to_response.includes('videos')) {
        fieldsToUnset.push('videos');
      }

      if (!append_to_response.includes('credits')) {
        fieldsToUnset.push('credits');
      }

      if (!append_to_response.includes('seasons')) {
        fieldsToUnset.push('seasons');
      }

      if (req.query?.append_to_response) {
        if (append_to_response.includes('episodes')) {
          // const episodes = await Episode.findOne({
          //   movie_id: req.params.id,
          // });

          // extraValue!.episodes = episodes;

          extraValue.episodes = [
            {
              $lookup: {
                from: 'episodes',
                localField: 'id',
                foreignField: 'movie_id',
                as: 'episodes'
              }
            }
            // {
            //   $addFields: {
            //     number_of_episodes: { $size: '$episodes' },
            //   },
            // },
          ];
        }
      }

      const extraValue2: {
        list: any[];
        history: any[];
        rate: any[];
      } = {
        list: [],
        history: [],
        rate: []
      };

      if (
        req.headers?.authorization ||
        req.cookies?.user_token ||
        res.locals.user
      ) {
        const userToken = res.locals.userToken;
        const user = res.locals.user as User;

        // const item_list = await List.findOne({
        //   user_id: user.id,
        //   movie_id: req.params.id,
        //   media_type: 'movie',
        // });

        // if (item_list != null) {
        //   extraValue2 = {
        //     ...extraValue2,
        //     in_list: item_list != null,
        //   };
        // }

        extraValue2.list = [
          {
            $lookup: {
              from: 'lists',
              localField: 'id',
              foreignField: 'movie_id',
              pipeline: [
                {
                  $match: {
                    $and: [
                      { $expr: { $eq: ['$media_type', 'movie'] } },
                      { $expr: { $eq: ['$user_id', user.id] } }
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
          }
        ];

        // const item_history = await History.findOne({
        //   user_id: user.id,
        //   movie_id: req.params.id,
        //   media_type: 'movie',
        // });

        // if (item_history != null) {
        //   extraValue2 = {
        //     ...extraValue2,
        //     history_progress: {
        //       duration: item_history.duration,
        //       percent: item_history.percent,
        //       seconds: item_history.seconds,
        //     },
        //   };
        // }

        extraValue2.history = [
          {
            $lookup: {
              from: 'histories',
              localField: 'id',
              foreignField: 'movie_id',
              pipeline: [
                {
                  $match: {
                    $and: [
                      { $expr: { $eq: ['$media_type', 'movie'] } },
                      { $expr: { $eq: ['$user_id', user.id] } }
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

        // const item_rate = await Rate.findOne({
        //   user_id: user.id,
        //   movie_id: req.params.id,
        //   movie_type: 'movie',
        // });

        // if (item_rate != null) {
        //   extraValue2 = {
        //     ...extraValue2,
        //     rated_value: item_rate.rate_value,
        //   };
        // }

        extraValue2.rate = [
          {
            $lookup: {
              from: 'rates',
              localField: 'id',
              foreignField: 'movie_id',
              pipeline: [
                {
                  $match: {
                    $and: [
                      { $expr: { $eq: ['$movie_type', 'movie'] } },
                      { $expr: { $eq: ['$user_id', user.id] } }
                    ]
                  }
                }
              ],
              as: 'rated_value'
            }
          },
          {
            $unwind: {
              path: '$rated_value',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $addFields: {
              rated_value: '$rated_value.rate_value'
            }
          }
        ];

        // return res.json({
        //   ...data[0],
        //   // ...extraValue,
        //   ...extraValue2,
        // });
      }

      const pipeline: any[] = [
        {
          $match: { id: req.params.id, media_type: req.params.type }
        }
      ];

      if (fieldsToUnset.length > 0) {
        pipeline.push({ $unset: fieldsToUnset });
      }

      pipeline.push(
        ...extraValue.episodes!,
        ...extraValue2.list,
        ...extraValue2.history,
        ...extraValue2.rate
      );

      const data = await Movie.aggregate(pipeline);

      if (data.length == 0) {
        return next(
          createHttpError.NotFound(
            `Movie with id: ${req.params.id} is not found`
          )
        );
      }

      return res.json({
        ...data[0]
        // ...extraValue
      });
    } catch (error) {
      return next(error);
    }
  }

  async updateView(req: Request, res: Response, next: NextFunction) {
    try {
      const movieId: string = req.params.id;

      const movie = await Movie.updateOne(
        { id: movieId },
        {
          $inc: { views: 1 }
        }
      );

      if (movie.modifiedCount != 1) {
        return res.json({
          success: false,
          result: 'Update views movie failed'
        });
      }

      return res.json({
        success: true,
        result: 'Update views movie successfully'
      });
    } catch (error) {
      return next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {}

  async updateMovie(req: Request, res: Response, next: NextFunction) {
    try {
      const formData: MovieForm = req.body;

      if (!formData) {
        throw createHttpError.InternalServerError(
          'Please provide full movie information'
        );
      }

      const movieId: string = req.params.id;

      const result = await Movie.updateOne(
        {
          id: movieId
        },
        {
          $set: {
            name: formData.name,
            original_name: formData.original_name,
            genres: formData.genres,
            original_language: formData.original_language,
            release_date: formData.release_date,
            overview: formData.overview,
            status: formData.status,
            budget: formData.budget,
            revenue: formData.revenue,
            vip: formData.vip,
            poster_path: formData.poster_path,
            backdrop_path: formData.backdrop_path,
            dominant_backdrop_color: formData.dominant_backdrop_color,
            dominant_poster_color: formData.dominant_poster_color,
            updated_at: new Date().toISOString()
          }
        }
      );

      if (result.modifiedCount != 1) {
        return next(
          createHttpError.InternalServerError('Update video path failed')
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

  async updateVideoUpload(req: Request, res: Response, next: NextFunction) {
    try {
      const videoPath: string = req.body?.video_path;
      const duration: string = req.body?.duration;

      if (!videoPath) {
        throw createHttpError.InternalServerError('Please provide video path');
      }

      const movieId: string = req.params.id;

      const result = await Movie.updateOne(
        {
          id: movieId
        },
        {
          $set: {
            video_path: videoPath,
            duration: duration,
            runtime: duration,
            updated_at: new Date().toISOString()
          }
        }
      );

      if (result.matchedCount != 1) {
        return next(
          createHttpError.InternalServerError('Update video path failed')
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

  async deleteMovie(req: Request, res: Response, next: NextFunction) {
    try {
      const movieId: string = req.params.id;

      const result = await MovieTest.deleteOne({
        id: movieId
      });

      if (result.deletedCount != 1) {
        return next(createHttpError.InternalServerError('Delete movie failed'));
      }

      return res.json({
        success: true,
        message: 'Delete movie suucessfully'
      });
    } catch (error) {
      return next(error);
    }
  }

  async deleteMovieMultiple(req: Request, res: Response, next: NextFunction) {
    try {
      const listMovieId: string[] | number[] = req.body.listMovieId;

      var results: DeleteResult[] = [];
      for (var movieId of listMovieId) {
        const result = await MovieTest.deleteOne({
          id: movieId
        });
        results.push(result);
      }

      if (results.some((r) => !r.acknowledged)) {
        return next(
          createHttpError.InternalServerError('Delete movies failed')
        );
      }

      return res.json({
        success: true,
        message: 'Delete movies suucessfully'
      });
    } catch (error) {
      return next(error);
    }
  }
}

export default new MovieController();
