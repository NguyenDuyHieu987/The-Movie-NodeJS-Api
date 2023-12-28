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
      const user_token =
        req.cookies.user_token ||
        req.headers.authorization!.replace('Bearer ', '');

      const user = jwt.verify(
        user_token,
        process.env.JWT_SIGNATURE_SECRET!
      ) as user;

      const subscription = await Subscription.aggregate([
        {
          $match: { account_id: user.id }
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

      if (subscription.length < 1) {
        return res.json(null);
      }

      return res.json(subscription[0]);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        res.clearCookie('user_token', {
          domain: req.hostname,
          httpOnly: req.session.cookie.httpOnly,
          sameSite: req.session.cookie.sameSite,
          secure: true
        });
        return res.json({ isTokenExpired: true, result: 'Token is expired' });
      }

      if (error instanceof jwt.JsonWebTokenError) {
        res.clearCookie('user_token', {
          domain: req.hostname,
          httpOnly: req.session.cookie.httpOnly,
          sameSite: req.session.cookie.sameSite,
          secure: true
        });
        return res.json({ isInvalidToken: true, result: 'Token is invalid' });
      }

      next(error);
    }
  }
}

export default new SubscriptionController();
