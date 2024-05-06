import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';

import { RedisCache } from '@/config/redis';
import Episode from '@/models/episode';

export class EpisodeController extends RedisCache {
  async getList(req: Request, res: Response, next: NextFunction) {
    try {
      const movieId: string = req.params.movieId;
      const seasonId: string = req.params.seasonId;
      // const seasonNumber: number = +req.params.seasonNumber;
      const skip: number = +req.query.skip! || 1;
      const limit: number = +req.query.limit! || 30;
      const from: number = +req.query.from! || 1;
      const to: number = +req.query.to! || 30;
      const key: string = req.originalUrl;
      const dataCache: any = await RedisCache.client.get(key);

      if (dataCache != null) {
        return res.json(JSON.parse(dataCache));
      }

      const result: {
        skip?: number;
        from?: number;
        to?: number;
        results: any[];
        limit?: number;
        total: number;
        total_episode: number;
      } = {
        results: [],
        total: 0,
        total_episode: 0
      };

      const episodes = await Episode.find({
        movie_id: movieId,
        season_id: seasonId,
        // season_number: seasonNumber,
        episode_number: {
          $gte: req.query?.from ? from : skip,
          $lte: req.query?.to ? to : limit + skip - 1
        }
      });

      const total = await Episode.countDocuments({
        movie_id: movieId,
        season_id: seasonId,
        // season_number: seasonNumber,
        episode_number: {
          $gte: req.query?.from ? from : skip,
          $lte: req.query?.to ? to : limit + skip - 1
        }
      });

      const total_episode = await Episode.countDocuments({
        movie_id: movieId,
        season_id: seasonId
        // season_number: seasonNumber,
      });

      if (req.query?.skip || (!req.query?.skip && !req.query?.from)) {
        result.skip = skip;
        result.limit = limit;
      }

      if (req.query?.from) {
        result.from = from;
        result.to = to;
      }

      result.results = episodes;
      result.total = total;
      result.total_episode = total_episode;

      if (episodes.length > 0) {
        await RedisCache.client.setEx(
          key,
          +process.env.REDIS_CACHE_TIME!,
          JSON.stringify(result)
        );
      }

      return res.json(result);
    } catch (error) {
      return next(error);
    }
  }

  async getLatest(req: Request, res: Response, next: NextFunction) {
    try {
      const movieId: string = req.params.movieId;
      const seasonId: string = req.params.seasonId;
      // const seasonNumber: number = +req.params.seasonNumber;
      const limit: number = +req.query.limit! || 7;
      const key: string = req.originalUrl;
      const dataCache: any = await RedisCache.client.get(key);

      if (dataCache != null) {
        return res.json(JSON.parse(dataCache));
      }

      const result: {
        results: any[];
        limit: number;
        total: number;
        total_episode: number;
      } = {
        results: [],
        limit: limit,
        total: 0,
        total_episode: 0
      };

      const episodes = await Episode.find({
        movie_id: movieId,
        season_id: seasonId
        // season_number: seasonNumber,
      })
        .sort({ episode_number: -1 })
        .limit(limit);

      const total = await Episode.countDocuments({
        movie_id: movieId,
        season_id: seasonId
        // season_number: seasonNumber,
      })
        .sort({ episode_number: -1 })
        .limit(limit);

      const total_episode = await Episode.countDocuments({
        movie_id: movieId,
        season_id: seasonId
        // season_number: seasonNumber,
      });

      result.results = episodes;
      result.total = total;
      result.total_episode = total_episode;

      if (episodes.length > 0) {
        await RedisCache.client.setEx(
          key,
          +process.env.REDIS_CACHE_TIME!,
          JSON.stringify(result)
        );
      }

      return res.json(result);
    } catch (error) {
      return next(error);
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
        episode_number: episodeNumber
      });

      if (episode != null) {
        await RedisCache.client.setEx(
          key,
          +process.env.REDIS_CACHE_TIME!,
          JSON.stringify(episode)
        );
      }

      return res.json(episode);
    } catch (error) {
      return next(error);
    }
  }
}

export default new EpisodeController();
