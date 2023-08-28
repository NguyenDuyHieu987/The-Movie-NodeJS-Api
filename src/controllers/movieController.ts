import type { NextFunction, Request, Response } from 'express';
import type { image, credit, user } from '@/types';
import jwt from 'jsonwebtoken';
import Movie from '@/models/movie';
import Image from '@/models/image';
import Video from '@/models/video';
import Credit from '@/models/credit';
import List from '@/models/list';
import History from '@/models/history';
import Rate from '@/models/rate';
import createHttpError from 'http-errors';

class MovieController {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await Movie.findOne({
        id: req.params.id,
      });

      if (data == null) {
        return next(
          createHttpError.NotFound(
            `Movie with id: ${req.params.id} is not found`
          )
        );
      }

      let append_to_response: string[] | null = null;
      let extraValue: {
        images?: image;
        videos?: Object[];
        credits?: credit;
      } = {};

      if (req.query?.append_to_response) {
        append_to_response = (req.query.append_to_response as string).split(
          ','
        );

        if (append_to_response.includes('images')) {
          const images = await Image.findOne({
            id: req.params.id,
          });

          extraValue!.images = images!.items;
        }

        if (append_to_response.includes('videos')) {
          const videos = await Video.findOne({
            id: req.params.id,
          });

          extraValue!.videos = videos!.items;
        }

        if (append_to_response.includes('credits')) {
          const credits = await Credit.findOne({
            id: req.params.id,
          });

          extraValue!.credits = credits!.items;
        }
      }

      if (req.headers?.authorization) {
        const user_token = req.headers.authorization.replace('Bearer ', '');
        const user = jwt.verify(
          user_token,
          process.env.JWT_SIGNATURE_SECRET!
        ) as user;

        let extraValue2 = {};

        const item_list = await List.findOne({
          user_id: user.id,
          movie_id: req.params.id,
          media_type: 'movie',
        });

        if (item_list != null) {
          extraValue2 = {
            ...extraValue2,
            in_list: item_list != null,
          };
        }

        const item_history = await History.findOne({
          user_id: user.id,
          movie_id: req.params.id,
          media_type: 'movie',
        });

        if (item_history != null) {
          extraValue2 = {
            ...extraValue2,
            history_progress: {
              duration: item_history.duration,
              percent: item_history.percent,
              seconds: item_history.seconds,
            },
          };
        }

        const item_rate = await Rate.findOne({
          user_id: user.id,
          movie_id: req.params.id,
          movie_type: 'movie',
        });

        console.log(item_rate);

        if (item_rate != null) {
          extraValue2 = {
            ...extraValue2,
            rated_value: item_rate.rate_value,
          };
        }

        return res.json({
          ...data?.toObject(),
          ...extraValue,
          ...extraValue2,
        });
      }

      return res.json({ ...data?.toObject(), ...extraValue });
    } catch (error) {
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
