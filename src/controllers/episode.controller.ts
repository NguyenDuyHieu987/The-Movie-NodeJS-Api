import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import { v4 as uuidv4 } from 'uuid';

import { RedisCache } from '@/config/redis';
import Episode, { EpisodeTest } from '@/models/episode';
import { EpisodeForm } from '@/types';
import { DeleteResult } from 'mongoose';

export class EpisodeController extends RedisCache {
  async getList(req: Request, res: Response, next: NextFunction) {
    try {
      const noCache: boolean = !!req.query?.no_cache;
      const movieId: string = req.params.movieId;
      const seasonId: string = req.params.seasonId;
      // const seasonNumber: number = +req.params.seasonNumber;
      const skip: number = +req.query.skip! || 1;
      const limit: number = +req.query.limit! || 50;
      const from: number = +req.query.from! || 1;
      const to: number = +req.query.to! || 50;
      const key: string = req.originalUrl;
      const dataCache: any = await RedisCache.client.get(key);

      if (dataCache != null && !noCache) {
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

      var episodes: any[] = [];
      if (limit != -1) {
        episodes = await Episode.find({
          movie_id: movieId,
          season_id: seasonId,
          // season_number: seasonNumber,
          episode_number: {
            $gte: req.query?.from ? from : skip,
            $lte: req.query?.to ? to : limit + skip - 1
          }
        });
      } else {
        episodes = await Episode.find({
          movie_id: movieId,
          season_id: seasonId
          // season_number: seasonNumber,
        });
      }

      var total = 0;
      if (limit != -1) {
        total = await Episode.countDocuments({
          movie_id: movieId,
          season_id: seasonId,
          // season_number: seasonNumber,
          episode_number: {
            $gte: req.query?.from ? from : skip,
            $lte: req.query?.to ? to : limit + skip - 1
          }
        });
      } else {
        total = await Episode.countDocuments({
          movie_id: movieId,
          season_id: seasonId
          // season_number: seasonNumber,
        });
      }

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

      if (episodes.length > 0 && !noCache) {
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

  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const noCache: boolean = !!req.query?.no_cache;
      const movieId: string = req.params.movieId;
      const seasonId: string = req.params.seasonId;
      // const seasonNumber: number = +req.params.seasonNumber;

      const query: string = (req.query.query as string) || '';
      const skip: number = +req.query.skip! || 1;
      const limit: number = +req.query.limit! || 50;
      const from: number = +req.query.from! || 1;
      const to: number = +req.query.to! || 50;
      const key: string = req.originalUrl;
      const dataCache: any = await RedisCache.client.get(key);

      if (dataCache != null && !noCache) {
        return res.json(JSON.parse(dataCache));
      }

      const result: {
        skip?: number;
        from?: number;
        to?: number;
        results: any[];
        limit?: number;
        total: number;
      } = {
        results: [],
        total: 0
      };

      var episodes: any[] = [];
      if (limit != -1) {
        episodes = await Episode.find({
          movie_id: movieId,
          season_id: seasonId,
          // season_number: seasonNumber,
          name: { $regex: query, $options: 'i' },
          episode_number: {
            $gte: req.query?.from ? from : skip,
            $lte: req.query?.to ? to : limit + skip - 1
          }
        });
      } else {
        episodes = await Episode.find({
          movie_id: movieId,
          season_id: seasonId,
          // season_number: seasonNumber,
          name: { $regex: query, $options: 'i' }
        });
      }

      var total = 0;
      if (limit != -1) {
        total = await Episode.countDocuments({
          movie_id: movieId,
          season_id: seasonId,
          // season_number: seasonNumber,
          name: { $regex: query, $options: 'i' },
          episode_number: {
            $gte: req.query?.from ? from : skip,
            $lte: req.query?.to ? to : limit + skip - 1
          }
        });
      } else {
        total = await Episode.countDocuments({
          movie_id: movieId,
          season_id: seasonId,
          // season_number: seasonNumber,
          name: { $regex: query, $options: 'i' }
        });
      }

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

      if (episodes.length > 0 && !noCache) {
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

      // if (dataCache != null) {
      //   return res.json(JSON.parse(dataCache));
      // }

      const episode = await Episode.findOne({
        movie_id: movieId,
        season_id: seasonId,
        // season_number: seasonNumber,
        episode_number: episodeNumber
      });

      // if (episode != null) {
      //   await RedisCache.client.setEx(
      //     key,
      //     +process.env.REDIS_CACHE_TIME!,
      //     JSON.stringify(episode)
      //   );
      // }

      return res.json(episode);
    } catch (error) {
      return next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const movieId: string = req.params.movieId;
      const seasonId: string = req.params.seasonId;
      const episodeId: string = req.params.episodeId;
      const key: string = req.originalUrl;
      const dataCache: any = await RedisCache.client.get(key);

      // if (dataCache != null) {
      //   return res.json(JSON.parse(dataCache));
      // }

      const episode = await Episode.findOne({
        movie_id: movieId,
        season_id: seasonId,
        id: episodeId
      });

      // if (episode != null) {
      //   await RedisCache.client.setEx(
      //     key,
      //     +process.env.REDIS_CACHE_TIME!,
      //     JSON.stringify(episode)
      //   );
      // }

      return res.json(episode);
    } catch (error) {
      return next(error);
    }
  }

  async updateView(req: Request, res: Response, next: NextFunction) {
    try {
      const episodeId: string = req.params.id;

      const episode = await Episode.updateOne(
        { id: episodeId },
        {
          $inc: { views: 1 }
        }
      );

      if (episode.modifiedCount == 1) {
        return res.json({
          success: false,
          result: 'Update views episode failed'
        });
      }

      return res.json({
        success: true,
        result: 'Update views episode successfully'
      });
    } catch (error) {
      return next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const formData: EpisodeForm = req.body;

      if (!formData) {
        throw createHttpError.InternalServerError(
          'Please provide full episode information'
        );
      }

      const id: string = uuidv4();

      const result = EpisodeTest.create({
        id: id,
        ...req.body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (result == null) {
        throw createHttpError.InternalServerError('Add episode failed');
      }

      return res.json({
        success: true,
        result: result
      });
    } catch (error) {
      return next(error);
    }
  }

  async updateEpisode(req: Request, res: Response, next: NextFunction) {
    try {
      const formData: EpisodeForm = req.body;

      if (!formData) {
        throw createHttpError.InternalServerError(
          'Please provide full episode information'
        );
      }

      const episodeId: string = req.params.id;

      const result = await EpisodeTest.updateOne(
        {
          id: episodeId
        },
        {
          $set: {
            name: formData.name,
            episode_type: formData.episode_type,
            air_date: formData.air_date,
            overview: formData.overview,
            episode_number: formData.episode_number,
            vip: formData.vip,
            still_path: formData.still_path,
            dominant_still_color: formData.dominant_still_color,
            updated_at: new Date().toISOString()
          }
        }
      );

      if (result.modifiedCount != 1) {
        return next(
          createHttpError.InternalServerError('Update video path failed')
        );
      }

      return res.json({
        success: true,
        result: result
      });
    } catch (error) {
      return next(error);
    }
  }

  async updateVideoUpload(req: Request, res: Response, next: NextFunction) {
    try {
      const videoPath: string = req.body?.video_path;
      const duration: string = req.body?.duration;

      if (!videoPath) {
        throw createHttpError.InternalServerError('Please provide video path');
      }

      const episodeId: string = req.params.id;

      const result = await Episode.updateOne(
        {
          id: episodeId
        },
        {
          $set: {
            video_path: videoPath,
            duration: duration,
            runtime: duration,
            updated_at: new Date().toISOString()
          }
        }
      );

      if (result.matchedCount != 1) {
        return next(
          createHttpError.InternalServerError('Update video path failed')
        );
      }

      return res.json({
        success: true,
        result: result
      });
    } catch (error) {
      return next(error);
    }
  }

  async deleteEpisode(req: Request, res: Response, next: NextFunction) {
    try {
      const episodeId: string = req.params.id;

      const result = await EpisodeTest.deleteOne({
        id: episodeId
      });

      if (result.deletedCount != 1) {
        return next(
          createHttpError.InternalServerError('Delete episode failed')
        );
      }

      return res.json({
        success: true,
        message: 'Delete episode suucessfully'
      });
    } catch (error) {
      return next(error);
    }
  }

  async deleteEpisodeMultiple(req: Request, res: Response, next: NextFunction) {
    try {
      const listEpisodeId: string[] | number[] = req.body.listEpisodeId;
      var results: DeleteResult[] = [];
      for (var episodeId of listEpisodeId) {
        const result = await EpisodeTest.deleteOne({
          id: episodeId
        });
        results.push(result);
      }

      if (results.some((r) => !r.acknowledged)) {
        return next(
          createHttpError.InternalServerError('Delete episodes failed')
        );
      }

      return res.json({
        success: true,
        message: 'Delete episodes suucessfully'
      });
    } catch (error) {
      return next(error);
    }
  }
}

export default new EpisodeController();
