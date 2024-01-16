import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';

import RedisCache from '@/config/redis';
import History from '@/models/history';
import List from '@/models/list';
import Movie from '@/models/movie';
import TV from '@/models/tv';
import { User } from '@/types';

class RecommendController extends RedisCache {
  constructor() {
    super();
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const userToken = res.locals.userToken;
      const user = res.locals.user as User;

      const page: number = +req.query.page! - 1 || 0;
      const limit: number = +req.query.limit! || 20;
      const key: string = `__recommend__${userToken}__` + req.originalUrl;
      const dataCache: any = await RedisCache.client.get(key);

      if (dataCache != null) {
        return res.json(JSON.parse(dataCache));
      }

      const list = await List.find({
        user_id: user.id
      })
        .skip(0)
        .limit(20)
        .sort({ created_at: -1 });

      const history = await History.find({
        user_id: user.id
      })
        .skip(0)
        .limit(20)
        .sort({ created_at: -1 });

      if (list.length == 0 && history.length == 0) {
        return res.json({
          results: []
        });
      }

      let genres: any[] = [];
      let countries: any[] = [];

      list.forEach((item) => {
        item.genres.forEach((genre) => {
          if (!genres.some((item1) => genre.id == item1.id)) {
            genres = [...genres, { id: genre.id }];
          }
        });

        if (!countries.includes(item.original_language)) {
          countries = [...countries, item.original_language];
        }
      });

      history.forEach((item) => {
        item.genres.forEach((genre) => {
          if (!genres.some((item1) => genre.id == item1.id)) {
            genres = [...genres, { id: genre.id }];
          }
        });

        if (!countries.includes(item.original_language)) {
          countries = [...countries, item.original_language];
        }
      });

      const movie = await Movie.find({
        $or: [
          {
            original_language: {
              $in: countries
            }
          },
          {
            genres: {
              $elemMatch: {
                $or: genres
              }
            }
          }
        ]
      })
        .skip(page * (limit / 2))
        .limit(limit / 2)
        .sort({ views: -1 });

      const tv = await TV.find({
        $or: [
          {
            original_language: {
              $in: countries
            }
          },
          {
            genres: {
              $elemMatch: {
                $or: genres
              }
            }
          }
        ]
      })
        .skip(page * (limit / 2))
        .limit(limit / 2)
        .sort({ views: -1 });

      const result = movie.concat(tv);

      const response = {
        page: page + 1,
        results: result,
        movie,
        tv,
        page_size: limit
      };

      await RedisCache.client.setEx(
        key,
        +process.env.REDIS_CACHE_TIME!,
        JSON.stringify(response)
      );

      return res.json(response);
    } catch (error) {
      return next(error);
    }
  }
}

export default new RecommendController();
