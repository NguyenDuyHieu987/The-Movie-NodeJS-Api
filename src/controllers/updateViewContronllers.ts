import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';

import Movie from '@/models/movie';
import TV from '@/models/tv';

class UpdateViewController {
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const movieId: string = req.params.movieId;
      const movieType: string = req.params.movieType;

      let isUpdate = false;

      switch (movieType) {
        case 'movie':
          const movie = await Movie.updateOne(
            { id: movieId },
            {
              $inc: { views: 1 }
            }
          );

          isUpdate = movie.modifiedCount == 1;
          break;
        case 'tv':
          const tv = await TV.updateOne(
            { id: movieId },
            {
              $inc: { views: 1 }
            }
          );

          isUpdate = tv.modifiedCount == 1;
          break;
        default:
          return next(
            createHttpError.NotFound(
              `Movie with type: ${movieType} is not found`
            )
          );
          break;
      }

      if (!isUpdate) {
        return res.json({
          success: false,
          result: 'Update views movie failed'
        });
      }

      return res.json({
        success: true,
        result: 'Update views movie successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new UpdateViewController();
