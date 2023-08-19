import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import SortOption from '@/models/sortby';

class SortOptionController {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      switch (req.params.slug) {
        case 'all':
          const data = await SortOption.find();

          res.json({ results: data });
          break;
        default:
          next(
            createHttpError.NotFound(
              `Sort options with slug: ${req.params.slug} is not found!`
            )
          );
          break;
      }
    } catch (error) {
      next(error);
    }
  }
}

export default new SortOptionController();
