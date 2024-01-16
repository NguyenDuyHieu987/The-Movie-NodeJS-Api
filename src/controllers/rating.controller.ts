import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import { v4 as uuidv4 } from 'uuid';

import Movie from '@/models/movie';
import Rate from '@/models/rate';
import TV from '@/models/tv';
import type { User } from '@/types';

class RatingController {
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

      const mediaType = req.params.movieType;
      const movieId = req.params.movieId;
      const rateValue: number = +req.body.value;

      switch (mediaType) {
        case 'movie':
          const movie = await Movie.findOne({ id: movieId });

          if (movie == null) {
            throw createHttpError.NotFound(`Movie is not exist`);
          }

          const voteAverage: number =
            (movie.vote_count! * movie.vote_average! + rateValue) /
            (movie.vote_count! + 1);

          const movieUpdated = await Movie.findOneAndUpdate(
            { id: movieId },
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
            movie_type: 'movie',
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

        case 'tv':
          const tv = await TV.findOne({ id: movieId });

          if (tv == null) {
            throw createHttpError.NotFound(`TV is not exist`);
          }

          const voteAverage1: number =
            (tv.vote_count! * tv.vote_average! + rateValue) /
            (tv.vote_count! + 1);

          const tvUpdated = await TV.findOneAndUpdate(
            { id: movieId },
            {
              $set: {
                vote_average: voteAverage1,
                vote_count: tv.vote_count! + 1
              }
            },
            { returnDocument: 'after' }
          );

          const idRate1: string = uuidv4();

          const result1 = await Rate.create({
            id: idRate1,
            rate_value: rateValue,
            user_id: user.id,
            movie_id: movieId,
            movie_type: 'tv',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

          if (result1 == null) {
            return res.json({
              success: false,
              result: 'Rate tv failed'
            });
          }

          return res.json({
            success: true,
            vote_average: tvUpdated!.vote_average,
            vote_count: tvUpdated!.vote_count,
            result: 'Rate tv successfully'
          });

        default:
          return next(
            createHttpError.NotFound(
              `Movie with type: ${mediaType} is not found`
            )
          );
      }
    } catch (error) {
      return next(error);
    }
  }
}

export default new RatingController();
