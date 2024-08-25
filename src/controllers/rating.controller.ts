import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import { v4 as uuidv4 } from 'uuid';

import Movie from '@/models/movie';
import Rate from '@/models/rate';
import TV from '@/models/tv';
import type { User } from '@/types';

export class RatingController {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const userToken = res.locals.userToken;
      const user = res.locals.user as User;

      const mediaType: string = req.params.movieType;
      const movieId: string = req.params.movieId;

      const rate = await Rate.findOne({
        user_id: user.id,
        movie_id: movieId,
        movie_type: mediaType
      });

      if (rate == null) {
        return res.json({
          success: false,
          result: 'This movie is not rated'
        });
      }

      return res.json({ success: true, result: rate });
    } catch (error) {
      return next(error);
    }
  }

  async rate(req: Request, res: Response, next: NextFunction) {
    try {
      const userToken = res.locals.userToken;
      const user = res.locals.user as User;

      const movieId = req.params.movieId;
      const mediaType = req.params.movieType;
      const rateValue: number = +req.body.value;

      const movie = await Movie.findOne({
        id: movieId,
        media_type: mediaType
      });

      if (movie == null) {
        throw createHttpError.NotFound(`Movie is not exist`);
      }

      const voteAverage: number =
        (movie.vote_count! * movie.vote_average! + rateValue) /
        (movie.vote_count! + 1);

      const movieUpdated = await Movie.findOneAndUpdate(
        { id: movieId, media_type: mediaType },
        {
          $set: {
            vote_average: voteAverage,
            vote_count: movie.vote_count! + 1
          }
        },
        { returnDocument: 'after' }
      );

      const idRate: string = uuidv4();

      const result = await Rate.create({
        id: idRate,
        rate_value: rateValue,
        user_id: user.id,
        movie_id: movieId,
        movie_type: mediaType,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (result == null) {
        return res.json({
          success: false,
          result: 'Rate movie failed'
        });
      }

      return res.json({
        success: true,
        vote_average: movieUpdated!.vote_average,
        vote_count: movieUpdated!.vote_count,
        result: 'Rate movie successfully'
      });
    } catch (error) {
      return next(error);
    }
  }
}

export default new RatingController();
