import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import { v4 as uuidv4 } from 'uuid';

import { RedisCache } from '@/config/redis';
import Genre from '@/models/genre';
import { GenreForm } from '@/types';
import { DeleteResult } from 'mongoose';

export class GenreController extends RedisCache {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const noCache: boolean = !!req.query?.no_cache;
      const key: string = req.originalUrl;
      const dataCache: any = await RedisCache.client.get(key);

      if (dataCache != null && !noCache) {
        return res.json(JSON.parse(dataCache));
      }

      const data = await Genre.find();

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

      const data = await Genre.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          {
            name_vietsub: { $regex: query, $options: 'i' }
          }
        ]
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
      const formData: GenreForm = req.body;

      if (!formData) {
        throw createHttpError.InternalServerError(
          'Please provide full genre information'
        );
      }

      // const id: string = uuidv4();

      const id: number = (await Genre.findOne().sort({ id: -1 }))!.id + 1;

      const result = Genre.create({
        id: id,
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

  async updateGenre(req: Request, res: Response, next: NextFunction) {
    try {
      const formData: GenreForm = req.body;

      if (!formData) {
        throw createHttpError.InternalServerError(
          'Please provide full genre information'
        );
      }

      const genreId: string = req.params.id;

      const result = await Genre.updateOne(
        {
          id: genreId
        },
        {
          $set: {
            name: formData.name,
            name_vietsub: formData.name_vietsub,
            short_name: formData.short_name,
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

  async deleteGenre(req: Request, res: Response, next: NextFunction) {
    try {
      const genreId: string = req.params.id;

      const result = await Genre.deleteOne({
        id: genreId
      });

      if (result.deletedCount != 1) {
        return next(createHttpError.InternalServerError('Delete genre failed'));
      }

      return res.json({
        success: true,
        message: 'Delete genre suucessfully'
      });
    } catch (error) {
      return next(error);
    }
  }

  async deleteGenreMultiple(req: Request, res: Response, next: NextFunction) {
    try {
      const listGenreId: string[] | number[] = req.body.listGenreId;
      var results: DeleteResult[] = [];
      for (var genreId of listGenreId) {
        const result = await Genre.deleteOne({
          id: genreId
        });
        results.push(result);
      }

      if (results.some((r) => !r.acknowledged)) {
        return next(
          createHttpError.InternalServerError('Delete genres failed')
        );
      }

      return res.json({
        success: true,
        message: 'Delete genres suucessfully'
      });
    } catch (error) {
      return next(error);
    }
  }
}

export default new GenreController();
