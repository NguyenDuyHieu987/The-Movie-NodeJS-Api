import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import TV from '@/models/tv';
import Season from '@/models/season';
import RedisCache from '@/config/redis';

class SeasonController extends RedisCache {
  constructor() {
    super();
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const movieId: string = req.params.movieId;
      const seasonNumber: number = +req.params.seasonNumber;
      const key: string = req.originalUrl;
      const dataCache: any = await RedisCache.client.get(key);

      if (dataCache != null) {
        return res.json(JSON.parse(dataCache));
      }

      const tv = await TV.findOne(
        {
          id: movieId,
        },
        {
          seasons: {
            $elemMatch: { season_number: seasonNumber },
          },
        }
      );

      if (tv != null && tv.seasons.length > 0) {
        const seasonId: string = tv.seasons[0].id;

        const season = await Season.findOne({
          id: seasonId,
          season_number: seasonNumber,
        });

        if (season != null) {
          await RedisCache.client.setEx(
            key,
            +process.env.REDIS_CACHE_TIME!,
            JSON.stringify(season)
          );

          res.json(season);
        } else {
          next(createHttpError.NotFound(`Season is not exist`));
        }
      } else {
        next(createHttpError.NotFound(`Movie is not exist`));
      }
    } catch (error) {
      next(error);
    }
  }
}

export default new SeasonController();
