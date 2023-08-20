import type { NextFunction, Request, Response } from 'express';
import Plan from '@/models/plan';
import RedisCache from '@/config/redis';

class PlanController extends RedisCache {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const key: string = req.originalUrl;
      const dataCache: any = await RedisCache.client.get(key);

      if (dataCache != null) {
        return res.json(JSON.parse(dataCache));
      }

      const data = await Plan.find().sort({ order: 1 });

      const response = { results: data };

      await RedisCache.client.setEx(
        key,
        +process.env.REDIS_CACHE_TIME!,
        JSON.stringify(response)
      );

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export default new PlanController();
