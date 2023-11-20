import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import Episode from '@/models/episode';
import RedisCache from '@/config/redis';

class EpisodeController extends RedisCache {
  async getList(req: Request, res: Response, next: NextFunction) {
    try {
      const movieId: string = req.params.movieId;
      const seasonId: string = req.params.seasonId;
      // const seasonNumber: number = +req.params.seasonNumber;
      const key: string = req.originalUrl;
      const dataCache: any = await RedisCache.client.get(key);

      if (dataCache != null) {
        return res.json(JSON.parse(dataCache));
      }

      const episodes = await Episode.find({
        movie_id: movieId,
        season_id: seasonId,
        // season_number: seasonNumber,
      });

      if (episodes.length > 0) {
        await RedisCache.client.setEx(
          key,
          +process.env.REDIS_CACHE_TIME!,
          JSON.stringify({ results: episodes })
        );

        return res.json({ results: episodes });
      } else {
        return next(createHttpError.NotFound(`Episodes is not exist`));
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
      const episodeNumber: number = +req.params.episodeNumber;
      const key: string = req.originalUrl;
      const dataCache: any = await RedisCache.client.get(key);

      if (dataCache != null) {
        return res.json(JSON.parse(dataCache));
      }

      const episode = await Episode.findOne({
        movie_id: movieId,
        season_id: seasonId,
        // season_number: seasonNumber,
        episode_number: episodeNumber,
      });

      if (episode != null) {
        await RedisCache.client.setEx(
          key,
          +process.env.REDIS_CACHE_TIME!,
          JSON.stringify(episode)
        );

        return res.json(episode);
      } else {
        return next(createHttpError.NotFound(`Episode is not exist`));
      }
    } catch (error) {
      next(error);
    }
  }
}

export default new EpisodeController();
