import type { NextFunction, Request, Response } from 'express';
import Video from '@/models/video';
import RedisCache from '@/config/redis';

class VideoController extends RedisCache {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const key: string = req.originalUrl;
      const dataCache: any = await RedisCache.client.get(key);

      if (dataCache != null) {
        return res.json(JSON.parse(dataCache));
      }

      const data = await Video.findOne({ movie_id: req.params.id });

      await RedisCache.client.setEx(
        key,
        +process.env.REDIS_CACHE_TIME!,
        JSON.stringify(data!.items)
      );

      res.json(data!.items);
    } catch (error) {
      next(error);
    }
  }
}

export default new VideoController();
