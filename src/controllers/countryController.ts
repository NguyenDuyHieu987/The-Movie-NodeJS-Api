import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import Country from '@/models/country';

class CountryController {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      switch (req.params.slug) {
        case 'all':
          const data = await Country.find();

          res.json({ results: data });
          break;
        default:
          next(
            createHttpError.NotFound(
              `Countries with slug: ${req.params.slug} is not found!`
            )
          );
          break;
      }
    } catch (error) {
      next(error);
    }
  }
}

export default new CountryController();
