import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

import Movie from '@/models/movie';
import Rate from '@/models/rate';
import TV from '@/models/tv';
import type { user } from '@/types';

class RatingController {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const user_token =
        req.cookies.user_token ||
        req.headers.authorization!.replace('Bearer ', '');

      const user = jwt.verify(user_token, process.env.JWT_SIGNATURE_SECRET!, {
        algorithms: ['HS256']
      }) as user;

      const mediaType: string = req.params.movieType;
      const movieId: string = req.params.movieId;

      const rate = await Rate.findOne({
        user_id: user.id,
        movie_id: movieId,
        movie_type: mediaType
      });

      if (rate != null) {
        return res.json({ success: true, result: rate });
      } else {
        return res.json({
          success: false,
          result: 'This movie is not rated'
        });
      }
    } catch (error) {
      if (
        error instanceof jwt.TokenExpiredError ||
        error instanceof jwt.JsonWebTokenError
      ) {
        res.clearCookie('user_token', {
          domain: req.hostname,
          httpOnly: req.session.cookie.httpOnly,
          sameSite: req.session.cookie.sameSite,
          secure: true
        });
      }
      next(error);
    }
  }

  async rate(req: Request, res: Response, next: NextFunction) {
    try {
      const user_token =
        req.cookies.user_token ||
        req.headers.authorization!.replace('Bearer ', '');

      const user = jwt.verify(user_token, process.env.JWT_SIGNATURE_SECRET!, {
        algorithms: ['HS256']
      }) as user;

      const mediaType = req.params.movieType;
      const movieId = req.params.movieId;
      const rateValue: number = +req.body.value;

      switch (mediaType) {
        case 'movie':
          const movie = await Movie.findOne({ id: movieId });

          if (movie != null) {
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

            if (result != null) {
              return res.json({
                success: true,
                vote_average: movieUpdated!.vote_average,
                vote_count: movieUpdated!.vote_count,
                result: 'Rate movie successfully'
              });
            } else {
              return res.json({
                success: false,
                result: 'Rate movie failed'
              });
            }
          } else {
            return next(createHttpError.NotFound(`Movie is not exist`));
          }
          break;
        case 'tv':
          const tv = await TV.findOne({ id: movieId });

          if (tv != null) {
            const voteAverage: number =
              (tv.vote_count! * tv.vote_average! + rateValue) /
              (tv.vote_count! + 1);

            const tvUpdated = await TV.findOneAndUpdate(
              { id: movieId },
              {
                $set: {
                  vote_average: voteAverage,
                  vote_count: tv.vote_count! + 1
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
              movie_type: 'tv',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

            if (result != null) {
              return res.json({
                success: true,
                vote_average: tvUpdated!.vote_average,
                vote_count: tvUpdated!.vote_count,
                result: 'Rate tv successfully'
              });
            } else {
              return res.json({
                success: false,
                result: 'Rate tv failed'
              });
            }
          } else {
            return next(createHttpError.NotFound(`TV is not exist`));
          }
          break;
        default:
          return next(
            createHttpError.NotFound(
              `Movie with type: ${mediaType} is not found`
            )
          );
          break;
      }
    } catch (error) {
      if (
        error instanceof jwt.TokenExpiredError ||
        error instanceof jwt.JsonWebTokenError
      ) {
        res.clearCookie('user_token', {
          domain: req.hostname,
          httpOnly: req.session.cookie.httpOnly,
          sameSite: req.session.cookie.sameSite,
          secure: true
        });
      }
      next(error);
    }
  }
}

export default new RatingController();
