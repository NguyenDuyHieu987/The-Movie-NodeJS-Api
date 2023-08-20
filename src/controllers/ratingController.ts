import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';
import { v4 as uuidv4 } from 'uuid';
import Rate from '@/models/rate';
import type { user } from '@/types';
import Movie from '@/models/movie';
import TV from '@/models/tv';

class RatingController {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const user_token = req.headers.authorization!.replace('Bearer ', '');

      const user = jwt.verify(user_token, process.env.JWT_SIGNATURE_SECRET!, {
        algorithms: ['HS256'],
      }) as user;

      const mediaType: string = req.params.type;
      const movieId: string = req.params.movieId;

      const rate = await Rate.findOne({
        user_id: user.id,
        movie_id: movieId,
        movie_type: mediaType,
      });

      if (rate != null) {
        res.json({ success: true, result: rate });
      } else {
        next(createHttpError.NotFound(`Rate is not exist`));
      }
    } catch (error) {
      next(error);
    }
  }

  async rate(req: Request, res: Response, next: NextFunction) {
    try {
      const user_token = req.headers.authorization!.replace('Bearer ', '');

      const user = jwt.verify(user_token, process.env.JWT_SIGNATURE_SECRET!, {
        algorithms: ['HS256'],
      }) as user;

      const movieId = req.body.movieId;
      const mediaType = req.body.type;
      const rateValue: number = req.body.value;

      switch (mediaType) {
        case 'movie':
          const movie = await Movie.findOne({ id: movieId });

          if (movie != null) {
            const voteAverage: number =
              (movie.vote_count! * movie.vote_average! + rateValue) /
              (movie.vote_count! + 1);

            const movieUpdated = await Movie.findByIdAndUpdate(
              { id: movieId },
              {
                $set: {
                  vote_average: voteAverage,
                  vote_count: movie.vote_count! + 1,
                },
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
              updated_at: new Date().toISOString(),
            });

            if (result != null) {
              res.json({
                success: true,
                vote_average: movieUpdated!.vote_average,
                vote_count: movieUpdated!.vote_count,
              });
            } else {
              next(createHttpError.InternalServerError(`Rate movie failed`));
            }
          } else {
            next(createHttpError.NotFound(`Movie is not exist`));
          }
          break;
        case 'tv':
          const tv = await TV.findOne({ id: movieId });

          if (tv != null) {
            const voteAverage: number =
              (tv.vote_count! * tv.vote_average! + rateValue) /
              (tv.vote_count! + 1);

            const movieUpdated = await TV.findByIdAndUpdate(
              { id: movieId },
              {
                $set: {
                  vote_average: voteAverage,
                  vote_count: tv.vote_count! + 1,
                },
              },
              { returnDocument: 'after' }
            );

            const idRate: string = uuidv4();

            const result = await Rate.create({
              id: idRate,
              rate_value: rateValue,
              user_id: user.id,
              movie_id: movieId,
              movie_type: 'tv',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

            if (result != null) {
              res.json({
                success: true,
                vote_average: movieUpdated!.vote_average,
                vote_count: movieUpdated!.vote_count,
              });
            } else {
              next(createHttpError.InternalServerError(`Rate movie failed`));
            }
          } else {
            next(createHttpError.NotFound(`Movie is not exist`));
          }
          break;
        default:
          next(
            createHttpError.NotFound(
              `Movie with type: ${mediaType} is not found`
            )
          );
          break;
      }
    } catch (error) {
      next(error);
    }
  }
}

export default new RatingController();
