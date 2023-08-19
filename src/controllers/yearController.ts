import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import Year from '@/models/year';

class YearController {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      switch (req.params.slug) {
        case 'all':
          const data = await Year.find();

          res.json({ results: data });
          break;
        default:
          next(
            createHttpError.NotFound(
              `Years with slug: ${req.params.slug} is not found!`
            )
          );
          break;
      }
    } catch (error) {
      next(error);
    }
  }
}

export default new YearController();
