import cryptoJs from 'crypto-js';
import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import moment from 'moment';
import fetch from 'node-fetch';
import qs from 'qs';
import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';

import RedisCache from '@/config/redis';
import { STRIPE_API_VERSION } from '@/config/stripe';
import Invoice from '@/models/invoice';
import Subscription from '@/models/subscription';
import type { User } from '@/types';

class SubscriptionController extends RedisCache {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const userToken = res.locals.userToken;
      const user = res.locals.user as User;

      const subscription = await Subscription.aggregate([
        {
          $match: { account_id: user.id }
        },
        {
          $lookup: {
            from: 'plans',
            localField: 'plan_id',
            foreignField: 'id',
            as: 'plan'
          }
        },
        {
          $unwind: '$plan'
        }
      ]);

      if (subscription.length < 1) {
        return res.json(null);
      }

      return res.json(subscription[0]);
    } catch (error) {
      return next(error);
    }
  }
}

export default new SubscriptionController();
