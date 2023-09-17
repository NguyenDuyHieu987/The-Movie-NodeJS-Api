import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import type { image, credit, user } from '@/types';
import jwt from 'jsonwebtoken';
import Movie from '@/models/movie';
import Image from '@/models/image';
import Video from '@/models/video';
import Credit from '@/models/credit';
import List from '@/models/list';
import History from '@/models/history';
import Rate from '@/models/rate';

class MovieController {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      let append_to_response: string[] | null = null;
      let extraValue: {
        // images?: image;
        // videos?: object[];
        // credits?: credit;
        images?: any[];
        videos?: any[];
        credits?: any[];
      } = {
        images: [],
        videos: [],
        credits: [],
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
                as: 'images',
              },
            },
            { $unwind: '$images' },
            {
              $addFields: {
                images: '$images.items',
              },
            },
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
                as: 'videos',
              },
            },
            { $unwind: '$videos' },
            {
              $addFields: {
                videos: '$videos.items',
              },
            },
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
                as: 'credits',
              },
            },
            { $unwind: '$credits' },
            {
              $addFields: {
                credits: '$credits.items',
              },
            },
          ];
        }
      }

      let extraValue2: {
        list: any[];
        history: any[];
        rate: any[];
      } = {
        list: [],
        history: [],
        rate: [],
      };

      if (req.headers?.authorization || req.cookies?.user_token != undefined) {
        const user_token =
          req.cookies?.user_token ||
          req.headers.authorization!.replace('Bearer ', '');

        const user = jwt.verify(
          user_token,
          process.env.JWT_SIGNATURE_SECRET!
        ) as user;

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
                      { $expr: { $eq: ['$user_id', user.id] } },
                    ],
                  },
                },
              ],
              as: 'history_progress',
            },
          },
          {
            $addFields: {
              history_progress: {
                $cond: [
                  {
                    $eq: [{ $size: '$history_progress' }, 1],
                  },
                  {
                    duration: '$history_progress.duration',
                    percent: '$history_progress.percent',
                    seconds: '$history_progress.seconds',
                  },
                  '$$REMOVE',
                ],
              },
            },
          },
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
                      { $expr: { $eq: ['$user_id', user.id] } },
                    ],
                  },
                },
              ],
              as: 'rated_value',
            },
          },
          {
            $unwind: {
              path: '$rated_value',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $addFields: {
              rated_value: '$rated_value.rate_value',
            },
          },
        ];

        // return res.json({
        //   ...data[0],
        //   // ...extraValue,
        //   ...extraValue2,
        // });
      }

      const data = await Movie.aggregate([
        {
          $match: { id: req.params.id },
        },
        ...extraValue.images!,
        ...extraValue.videos!,
        ...extraValue.credits!,
        ...extraValue2.list,
        ...extraValue2.history,
        ...extraValue2.rate,
      ]);

      if (data.length == 0) {
        return next(
          createHttpError.NotFound(
            `Movie with id: ${req.params.id} is not found`
          )
        );
      }

      return res.json({
        ...data[0],
        // ...extraValue
      });
    } catch (error) {
      if (
        error instanceof jwt.TokenExpiredError ||
        error instanceof jwt.JsonWebTokenError
      ) {
        res.clearCookie('user_token', {
          httpOnly: req.sessionOptions.httpOnly,
          sameSite: req.sessionOptions.sameSite,
          secure: true,
        });
      }
      next(error);
    }
  }

  // async update(req, res, next) {
  //   try {
  //     switch (req.params.slug1) {
  //       case 'rating':
  //         let doc = await MovieDetail.findOne({
  //           id: req.params.movieid,
  //         }).catch((error) => {
  //           res.status(400).json(errorMsg.errDefault);
  //           next(error);
  //         });

  //         var newRating =
  //           (doc.vote_count * doc.vote_average + req.body.value) /
  //           (doc.vote_count + 1);
  //         doc.vote_average = newRating;
  //         doc.vote_count += 1;
  //         await doc.save();

  //         break;
  //       default:
  //         res.status(400).json(errorMsg.errDefault);
  //         break;
  //     }
  //   } catch (error) {
  //     res.status(400).json(errorMsg.errDefault);
  //   } finally {
  //   }
  // }
}

export default new MovieController();
