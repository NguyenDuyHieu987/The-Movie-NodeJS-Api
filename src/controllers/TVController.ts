import type { NextFunction, Request, Response } from 'express';
import TV from '@/models/tv';
import Season from '@/models/Season';

class TVController {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await TV.findOne({
        id: req.params.id,
      });
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  // async season(req, res, next) {
  //   try {
  //     var doc = await TVdetail.findOne(
  //       { id: req.params.movieid },
  //       {
  //         seasons: {
  //           $elemMatch: { season_number: +req.params.seasonnumber },
  //         },
  //       }
  //     ).catch((error) => {
  //       res.status(400).json(errorMsg.errDefault);
  //       next(error);
  //     });

  //     Season.findOne({
  //       id: doc.seasons[0].id,
  //     })
  //       .then((seasonRes) => {
  //         res.json(mongooseToObject(seasonRes));
  //       })
  //       .catch((error) => {
  //         res.status(400).json(errorMsg.errDefault);
  //         next(error);
  //       });
  //   } catch (error) {
  //     res.status(400).json(errorMsg.errDefault);
  //   } finally {
  //   }
  // }

  // async update(req, res, next) {
  //   try {
  //     switch (req.params.slug1) {
  //       case 'rating':
  //         let doc = await TVdetail.findOne({
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

export default new TVController();
