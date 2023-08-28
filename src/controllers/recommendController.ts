import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import Movie from '@/models/movie';
import TV from '@/models/tv';
import List from '@/models/list';
import History from '@/models/history';
import RedisCache from '@/config/redis';
import { user } from '@/types';

class RecommendController extends RedisCache {
  constructor() {
    super();
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const user_token = req.headers.authorization!.replace('Bearer ', '');

      const user = jwt.verify(user_token, process.env.JWT_SIGNATURE_SECRET!, {
        algorithms: ['HS256'],
      }) as user;

      const page: number = +req.query?.page! - 1 || 0;
      const limit: number = +req.query?.limit! || 12;
      const key: string = req.originalUrl;
      const dataCache: any = await RedisCache.client.get(key);

      if (dataCache != null) {
        return res.json(JSON.parse(dataCache));
      }

      const list = await List.find({
        user_id: user.id,
      })
        .skip(0)
        .limit(20)
        .sort({ created_at: -1 });

      const history = await List.find({
        user_id: user.id,
      })
        .skip(0)
        .limit(20)
        .sort({ created_at: -1 });

      if (list.length == 0 && history.length == 0) {
        return res.json({
          results: [],
        });
      }

      let genres: any[] = [];
      let countries: any[] = [];

      list.forEach((item) => {
        item.genres.forEach((genre) => {
          genres = [...genres, { id: genre.id }];
        });

        countries = [...countries, item.original_language];
      });

      const movie = await Movie.find({
        $or: [
          {
            original_language: {
              $in: countries,
            },
          },
          {
            genres: {
              $elemMatch: {
                $or: genres,
              },
            },
          },
        ],
      })
        .skip(page * limit)
        .limit(limit)
        .sort({ views: -1 });

      const tv = await TV.find({
        $or: [
          {
            original_language: {
              $in: countries,
            },
          },
          {
            genres: {
              $elemMatch: {
                $or: [...genres],
              },
            },
          },
        ],
      })
        .skip(page * limit)
        .limit(limit)
        .sort({ views: -1 });

      const result = movie.concat(tv);

      const response = {
        page: page + 1,
        results: result,
        movie: movie,
        tv: tv,
        page_size: limit,
      };

      await RedisCache.client.setEx(
        key,
        +process.env.REDIS_CACHE_TIME!,
        JSON.stringify(response)
      );

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export default new RecommendController();
