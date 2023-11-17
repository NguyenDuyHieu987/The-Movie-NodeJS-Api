import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import Season from '@/models/season';
import RedisCache from '@/config/redis';

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
        series_id: seriesId,
      });

      const response = { results: seasons };

      if (seasons.length > 0) {
        await RedisCache.client.setEx(
          key,
          +process.env.REDIS_CACHE_TIME!,
          JSON.stringify(response)
        );

        res.json(response);
      } else {
        next(createHttpError.NotFound(`Seasons is not exist`));
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
            movie_id: movieId,
            // season_number: seasonNumber
          },
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
                      { $eq: ['$movie_id', '$$movieId'] },
                    ],
                  },
                },
              },
            ],
            as: 'episodes',
          },
        },
      ]);

      if (season.length > 0) {
        await RedisCache.client.setEx(
          key,
          +process.env.REDIS_CACHE_TIME!,
          JSON.stringify(season[0])
        );

        res.json(season[0]);
      } else {
        next(createHttpError.NotFound(`Season is not exist`));
      }
    } catch (error) {
      next(error);
    }
  }
}

export default new SeasonController();
