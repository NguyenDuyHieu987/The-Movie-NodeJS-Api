import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';

import Credit from '@/models/credit';
import History from '@/models/history';
import Image from '@/models/image';
import List from '@/models/list';
import Rate from '@/models/rate';
import Season from '@/models/season';
import TV from '@/models/tv';
import Video from '@/models/video';
import type { TCredit, TImage, User } from '@/types';

export class TVController {
  async detail(req: Request, res: Response, next: NextFunction) {
    try {
      let append_to_response: string[] | null = null;
      const extraValue: {
        // images?: TImage;
        // videos?: object[];
        // credits?: TCredit;
        // seasons?: any;
        images?: any[];
        videos?: any[];
        credits?: any[];
        seasons?: any[];
        episodes?: any[];
      } = {
        images: [],
        videos: [],
        credits: [],
        seasons: [],
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

      if (req.query?.append_to_response) {
        if (append_to_response.includes('seasons')) {
          // const seasons = await Season.findOne({
          //   movie_id: req.params.id,
          // });

          // extraValue!.seasons = seasons;

          extraValue.seasons = [
            {
              $lookup: {
                from: 'seasons',
                localField: 'season_id',
                foreignField: 'id',
                as: 'season'
              }
            },
            { $unwind: '$season' },
            {
              $lookup: {
                from: 'seasons',
                localField: 'series_id',
                foreignField: 'series_id',
                as: 'seasons'
              }
            },
            {
              $addFields: {
                number_of_seasons: { $size: '$seasons' }
              }
            }
          ];
        }

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
            },
            {
              $lookup: {
                from: 'episodes',
                localField: 'season_id',
                foreignField: 'season_id',
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
        //   media_type: 'tv',
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
                      { $expr: { $eq: ['$media_type', 'tv'] } },
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
        //   media_type: 'tv',
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
                      { $expr: { $eq: ['$media_type', 'tv'] } },
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
        //   movie_type: 'tv',
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
                      { $expr: { $eq: ['$movie_type', 'tv'] } },
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
          $match: { id: req.params.id }
        }
      ];

      if (fieldsToUnset.length > 0) {
        pipeline.push({ $unset: fieldsToUnset });
      }

      pipeline.push(
        ...extraValue.seasons!,
        ...extraValue.episodes!,
        ...extraValue2.list,
        ...extraValue2.history,
        ...extraValue2.rate
      );

      const data = await TV.aggregate(pipeline);

      if (data.length == 0) {
        return next(
          createHttpError.NotFound(
            `Movie with id: ${req.params.id} is not found`
          )
        );
      }

      return res.json({
        ...data[0]
        //  ...extraValue
      });
    } catch (error) {
      return next(error);
    }
  }

  async updateView(req: Request, res: Response, next: NextFunction) {
    try {
      const movieId: string = req.params.id;

      const tv = await TV.updateOne(
        { id: movieId },
        {
          $inc: { views: 1 }
        }
      );

      if (tv.modifiedCount != 1) {
        return res.json({
          success: false,
          result: 'Update views tv failed'
        });
      }

      return res.json({
        success: true,
        result: 'Update views tv successfully'
      });
    } catch (error) {
      return next(error);
    }
  }
}

export default new TVController();
