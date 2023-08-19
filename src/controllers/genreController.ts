import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import Genre from '@/models/genre';

class GenreController {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      switch (req.params.slug) {
        case 'all':
          const data = await Genre.find();

          res.json({ results: data });
          break;
        default:
          next(
            createHttpError.NotFound(
              `Genres with slug: ${req.params.slug} is not found!`
            )
          );
          break;
      }
    } catch (error) {
      next(error);
    }
  }
}

export default new GenreController();
