import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import ISO6391 from 'iso-639-1';
import ISO31661 from 'iso-3166-1';

import { RedisCache } from '@/config/redis';
import Country from '@/models/country';
import { DeleteResult } from 'mongoose';
import { CountryForm } from '@/types';

export class CountryController extends RedisCache {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const noCache: boolean = !!req.query?.no_cache;
      const key: string = req.originalUrl;
      const dataCache: any = await RedisCache.client.get(key);

      // if (dataCache != null && !noCache) {
      //   return res.json(JSON.parse(dataCache));
      // }

      const data = await Country.find().sort({ name: 1 });

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

      const data = await Country.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { english_name: { $regex: query, $options: 'i' } }
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
      const formData: CountryForm = req.body;

      if (!formData) {
        throw createHttpError.InternalServerError(
          'Please provide full genre information'
        );
      }

      // const id: string = uuidv4();
      const iso_3166_1 = ISO31661.whereCountry(req.body.english_name);
      if (!iso_3166_1) {
        return res.json({
          success: false,
          message: `No iso_3166_1 code found for country: '${req.body.english_name}'`
        });
      }

      const country = await Country.findOne({ iso_3166_1: iso_3166_1 });

      if (country != null) {
        return res.json({
          success: false,
          message: `Country already exists`
        });
      }

      const result = await Country.create({
        iso_3166_1: iso_3166_1,
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

  async updateCountry(req: Request, res: Response, next: NextFunction) {
    try {
      const formData: CountryForm = req.body;

      if (!formData) {
        throw createHttpError.InternalServerError(
          'Please provide full country information'
        );
      }

      const countryId: string = req.params.id;

      const iso_3166_1 = ISO31661.whereCountry(req.body.english_name);
      if (!iso_3166_1) {
        return res.json({
          success: false,
          message: `No iso_3166_1 code found for country: '${req.body.english_name}'`
        });
      }

      const country = await Country.findOne({
        $and: [{ iso_3166_1: { $ne: countryId } }, { iso_3166_1: iso_3166_1 }]
      });

      if (country != null) {
        return res.json({
          success: false,
          message: `Country already exists`
        });
      }

      const result = await Country.updateOne(
        {
          iso_3166_1: countryId
        },
        {
          $set: {
            iso_3166_1: iso_3166_1,
            english_name: formData.english_name,
            name: formData.name,
            short_name: formData.short_name,
            updated_at: new Date().toISOString()
          }
        }
      );

      if (result.modifiedCount != 1) {
        return next(
          createHttpError.InternalServerError('Update country failed')
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

  async deleteCountry(req: Request, res: Response, next: NextFunction) {
    try {
      const countryId: string = req.params.id;

      const result = await Country.deleteOne({
        iso_3166_1: countryId
      });

      if (result.deletedCount != 1) {
        return next(
          createHttpError.InternalServerError('Delete country failed')
        );
      }

      return res.json({
        success: true,
        message: 'Delete country suucessfully'
      });
    } catch (error) {
      return next(error);
    }
  }

  async deleteCountryMultiple(req: Request, res: Response, next: NextFunction) {
    try {
      const listCountryId: string[] | number[] = req.body.listCountryId;
      var results: DeleteResult[] = [];
      for (var genreId of listCountryId) {
        const result = await Country.deleteOne({
          iso_3166_1: genreId
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

export default new CountryController();
