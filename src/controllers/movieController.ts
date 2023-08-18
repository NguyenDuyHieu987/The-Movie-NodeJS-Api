import type { NextFunction, Request, Response } from 'express';
import Movie from '@/models/movie';
import Image from '@/models/image';
import Video from '@/models/video';
import Credit from '@/models/credit';
import type { image, credit } from '@/types';

class MovieController {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await Movie.findOne({
        id: req.params.id,
      });
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

          extraValue!.images = images?.items;
        }

        if (append_to_response.includes('videos')) {
          const videos = await Video.findOne({
            id: req.params.id,
          });

          extraValue!.videos = videos?.items;
        }

        if (append_to_response.includes('credits')) {
          const credits = await Credit.findOne({
            id: req.params.id,
          });

          extraValue!.credits = credits?.items;
        }
      }

      res.json({ ...data?.toObject(), ...extraValue });
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
