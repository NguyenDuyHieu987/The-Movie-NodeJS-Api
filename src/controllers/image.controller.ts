import type { NextFunction, Request, Response } from 'express';

import RedisCache from '@/config/redis';
import Image from '@/models/image';

class ImageController extends RedisCache {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const key: string = req.originalUrl;
      const dataCache: any = await RedisCache.client.get(key);

      if (dataCache != null) {
        return res.json(JSON.parse(dataCache));
      }

      const data = await Image.findOne({ movie_id: req.params.id });

      await RedisCache.client.setEx(
        key,
        +process.env.REDIS_CACHE_TIME!,
        JSON.stringify(data!.items)
      );

      return res.json(data!.items);
    } catch (error) {
      return next(error);
    }
  }
}

export default new ImageController();
