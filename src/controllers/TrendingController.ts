import type { NextFunction, Request, Response } from 'express';
import Trending from '@/models/trending';
import createHttpError from 'http-errors';

class TrendingController {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const page: number = +req.query?.page! - 1 || 0;
      const limit: number = +req.query?.limit! || 20;

      switch (req.params.slug) {
        case 'all':
          const data = await Trending.find()
            .skip(page * limit)
            .limit(limit);

          const total = await Trending.countDocuments({});

          res.json({
            page: page + 1,
            results: data,
            total: total,
            page_size: limit,
          });

          break;
        default:
          createHttpError.NotFound(`Not found with slug: ${req.params.slug}!`);
          break;
      }
    } catch (error) {
      next(error);
    }
  }
}

export default new TrendingController();
