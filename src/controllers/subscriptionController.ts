import cryptoJs from 'crypto-js';
import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import moment from 'moment';
import fetch from 'node-fetch';
import qs from 'qs';
import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';

import RedisCache from '@/config/redis';
import { STRIPE_API_VERSION } from '@/config/stripe';
import Invoice from '@/models/invoice';
import Subscription from '@/models/subscription';
import type { user } from '@/types';

class SubscriptionController extends RedisCache {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      //   const user_token =
      //     req.cookies.user_token ||
      //     req.headers.authorization!.replace('Bearer ', '');

      //   const user = jwt.verify(
      //     user_token,
      //     process.env.JWT_SIGNATURE_SECRET!
      //   ) as user;

      const key: string = req.originalUrl;
      const dataCache: any = await RedisCache.client.get(key);

      const userId = 'bdba8e44-9e1f-447e-b633-a70452a85280';

      const subscription = await Subscription.aggregate([
        {
          $match: { account_id: userId }
        },
        {
          $lookup: {
            from: 'plans',
            localField: 'plan_id',
            foreignField: 'id',
            as: 'vip'
          }
        },
        {
          $unwind: '$vip'
        },
        {
          $addFields: {
            vip: '$vip.vip'
          }
        }
      ]);

      return res.json(subscription);
    } catch (error) {
      next(error);
    }
  }
}

export default new SubscriptionController();
