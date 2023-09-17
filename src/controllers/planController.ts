import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import fetch from 'node-fetch';
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

      if (data != null) {
        const response = { results: data };

        await RedisCache.client.setEx(
          key,
          +process.env.REDIS_CACHE_TIME!,
          JSON.stringify(response)
        );

        res.json(response);
      } else {
        next(createHttpError.NotFound(`Plan is not exist`));
      }
    } catch (error) {
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const planId: string = req.params.id;
      const plan = await Plan.findOne({ id: planId });

      // const Response: any = await fetch(
      //   process.env.VNP_URL! + '?' + new URLSearchParams({})
      // ).then((res) => res.json());

      // next(createHttpError.NotFound(`Plan is not exist`));
    } catch (error) {
      next(error);
    }
  }
}

export default new PlanController();
