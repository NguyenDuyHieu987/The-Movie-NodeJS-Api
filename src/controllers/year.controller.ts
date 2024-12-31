import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';

import { RedisCache } from '@/config/redis';
import Year from '@/models/year';
import { YearForm } from '@/types';
import { DeleteResult, Types } from 'mongoose';

export class YearController extends RedisCache {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const noCache: boolean = !!req.query?.no_cache;
      const key: string = req.originalUrl;
      const dataCache: any = await RedisCache.client.get(key);

      if (dataCache != null && !noCache) {
        return res.json(JSON.parse(dataCache));
      }

      const data = await Year.find();

      const response = { results: data };

      if (data.length > 0 && !noCache) {
        await RedisCache.client.setEx(
          key,
          +process.env.REDIS_CACHE_TIME!,
          JSON.stringify(response)
        );
      }
      return res.json(response);
    } catch (error) {
      return next(error);
    }
  }

  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const query: string = (req.query.query as string) || '';
      const noCache: boolean = !!req.query?.no_cache;
      const key: string = req.originalUrl;
      const dataCache: any = await RedisCache.client.get(key);

      if (dataCache != null && !noCache) {
        return res.json(JSON.parse(dataCache));
      }

      const data = await Year.find({
        name: { $regex: query, $options: 'i' }
      });

      const response = { results: data };

      if (data.length > 0 && !noCache) {
        await RedisCache.client.setEx(
          key,
          +process.env.REDIS_CACHE_TIME!,
          JSON.stringify(response)
        );
      }

      return res.json(response);
    } catch (error) {
      return next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const formData: YearForm = req.body;

      if (!formData) {
        throw createHttpError.InternalServerError(
          'Please provide full genre information'
        );
      }

      const year = await Year.findOne({ name: req.body.name });

      if (year != null) {
        return res.json({
          success: false,
          message: `Year already exists`
        });
      }

      const result = await Year.create({
        ...req.body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (result == null) {
        throw createHttpError.InternalServerError('Add genre failed');
      }

      return res.json({
        success: true,
        result: result
      });
    } catch (error) {
      return next(error);
    }
  }

  async updateYear(req: Request, res: Response, next: NextFunction) {
    try {
      const formData: YearForm = req.body;

      if (!formData) {
        throw createHttpError.InternalServerError(
          'Please provide full year information'
        );
      }

      const yearId: string = req.params.id;

      const year = await Year.findOne({
        _id: { $ne: yearId },
        name: req.body.name
      });

      if (year != null) {
        return res.json({
          success: false,
          message: `Year already exists`
        });
      }

      const result = await Year.updateOne(
        {
          _id: yearId
        },
        {
          $set: {
            name: formData.name,
            updated_at: new Date().toISOString()
          }
        }
      );

      if (result.modifiedCount != 1) {
        return next(createHttpError.InternalServerError('Update year failed'));
      }

      return res.json({
        success: true,
        result: result
      });
    } catch (error) {
      return next(error);
    }
  }

  async deleteYear(req: Request, res: Response, next: NextFunction) {
    try {
      const yearId: string = req.params.id;

      const result = await Year.deleteOne({
        _id: yearId
      });

      if (result.deletedCount != 1) {
        return next(createHttpError.InternalServerError('Delete year failed'));
      }

      return res.json({
        success: true,
        message: 'Delete year suucessfully'
      });
    } catch (error) {
      return next(error);
    }
  }

  async deleteYearMultiple(req: Request, res: Response, next: NextFunction) {
    try {
      const listYearId: string[] | number[] = req.body.listYearId;
      var results: DeleteResult[] = [];
      for (var yearId of listYearId) {
        const result = await Year.deleteOne({
          _id: yearId
        });
        results.push(result);
      }

      if (results.some((r) => !r.acknowledged)) {
        return next(createHttpError.InternalServerError('Delete years failed'));
      }

      return res.json({
        success: true,
        message: 'Delete years suucessfully'
      });
    } catch (error) {
      return next(error);
    }
  }
}

export default new YearController();
