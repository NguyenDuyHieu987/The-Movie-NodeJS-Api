import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import Genre from '@/models/genre';
import RedisCache from '@/config/redis';
import TV from '@/models/tv';

class GenreController extends RedisCache {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const key: string = req.originalUrl;
      const dataCache: any = await RedisCache.client.get(key);

      // if (dataCache != null) {
      //   return res.json(JSON.parse(dataCache));
      // }

      // TV.updateMany(
      //   { genres: { $elemMatch: { id: 10762 } } },
      //   { $set: { 'genres.$[element].name': 'Trẻ em' } },
      //   { upsert: true, arrayFilters: [{ 'element.id': 10762 }] }
      // );

      const tv = await TV.aggregate([
        {
          $match: {
            id: 'dd8f8524-a584-527f-b4e3-2a8777c50e53',
          },
        },
        {
          $lookup: {
            from: 'seasons',
            localField: 'series_id',
            foreignField: 'series_id',
            as: 'seasons',
          },
        },
        {
          $addFields: {
            number_of_seasons: { $size: '$seasons' },
          },
        },
        {
          $lookup: {
            from: 'videos',
            localField: 'id',
            foreignField: 'movie_id',
            as: 'videos',
          },
        },
        { $unwind: '$videos' },
        {
          $addFields: {
            videos: '$videos.items',
          },
        },
      ]);

      return res.json(tv[0]);

      switch (req.params.slug) {
        case 'all':
          const data = await Genre.find();

          const response = { results: data };

          await RedisCache.client.setEx(
            key,
            +process.env.REDIS_CACHE_TIME!,
            JSON.stringify(response)
          );

          res.json(response);
          break;
        default:
          next(
            createHttpError.NotFound(
              `Genres with slug: ${req.params.slug} is not found!`
            )
          );
          break;
      }
    } catch (error) {
      next(error);
    }
  }
}

export default new GenreController();
