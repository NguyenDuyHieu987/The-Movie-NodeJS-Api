import type { NextFunction, Request, Response } from 'express';
import { mongooseToObject } from '@/utils/mongoose';
import { multipleMongooseToObject } from '@/utils/mongoose';
import DataMovies from '@/models/DataMovies';
import errorMsg from '@/utils/errorMsg';

class TrendingController {
  index(req: Request, res: Response, next: NextFunction) {
    try {
      switch (req.params.slug) {
        case 'all':
          DataMovies.Trending.findOne({
            page: req.query.page === undefined ? 1 : req.query.page,
          })
            .then((dataMovies) => {
              res.json(mongooseToObject(dataMovies));
            })
            .catch((error) => {
              res.status(400).json(errorMsg.errDefault);
              next(error);
            });
          break;
        default:
          res.status(400).json(errorMsg.errDefault);
          break;
      }
    } catch (error) {
      res.status(400).json(errorMsg.errDefault);
    } finally {
    }
  }
}

export default new TrendingController();
