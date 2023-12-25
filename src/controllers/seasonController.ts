import RedisCache from '@/config/redis';
import Season from '@/models/season';
import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';

class SeasonController extends RedisCache {
  async getList(req: Request, res: Response, next: NextFunction) {
    try {
      const seriesId: string = req.params.seriesId;
      const key: string = req.originalUrl;
      const dataCache: any = await RedisCache.client.get(key);

      if (dataCache != null) {
        return res.json(JSON.parse(dataCache));
      }

      const seasons = await Season.find({
        series_id: seriesId
      });

      const response = { results: seasons };

      if (seasons.length > 0) {
        await RedisCache.client.setEx(
          key,
          +process.env.REDIS_CACHE_TIME!,
          JSON.stringify(response)
        );

        return res.json(response);
      } else {
        return next(createHttpError.NotFound(`Seasons is not exist`));
      }
    } catch (error) {
      next(error);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const movieId: string = req.params.movieId;
      const seasonId: string = req.params.seasonId;
      // const seasonNumber: number = +req.params.seasonNumber;
      const key: string = req.originalUrl;
      const dataCache: any = await RedisCache.client.get(key);

      if (dataCache != null) {
        return res.json(JSON.parse(dataCache));
      }

      const season = await Season.aggregate([
        {
          $match: {
            id: seasonId,
            movie_id: movieId
            // season_number: seasonNumber
          }
        },
        {
          $lookup: {
            from: 'episodes',
            localField: 'id',
            foreignField: 'season_id',
            let: { id: '$id', movieId: '$movie_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$season_id', '$$id'] },
                      { $eq: ['$movie_id', '$$movieId'] }
                    ]
                  }
                }
              }
            ],
            as: 'episodes'
          }
        }
      ]);

      if (season.length > 0) {
        await RedisCache.client.setEx(
          key,
          +process.env.REDIS_CACHE_TIME!,
          JSON.stringify(season[0])
        );

        return res.json(season[0]);
      } else {
        return next(createHttpError.NotFound(`Season is not exist`));
      }
    } catch (error) {
      next(error);
    }
  }
}

export default new SeasonController();
