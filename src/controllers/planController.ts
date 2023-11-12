import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import fetch from 'node-fetch';
import Plan from '@/models/plan';
import RedisCache from '@/config/redis';
import moment from 'moment';
import cryptoJs from 'crypto-js';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import type { user } from '@/types';
import qs from 'qs';
import Stripe from 'stripe';

class PlanController extends RedisCache {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const key: string = req.originalUrl;
      const dataCache: any = await RedisCache.client.get(key);

      if (dataCache != null) {
        return res.json(JSON.parse(dataCache));
      }

      const plans = await Plan.find().sort({ order: 1 });

      const response = { results: plans };

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

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const user_token =
        req.cookies.user_token ||
        req.headers.authorization!.replace('Bearer ', '');

      const user = jwt.verify(
        user_token,
        process.env.JWT_SIGNATURE_SECRET!
      ) as user;

      const planId: string = req.params.id;
      const plan = await Plan.findOne({ id: planId });

      const method: 'MOMO' | 'ZALOPAY' | 'VNPAY' | 'STRIPE' = req.body.method;

      if (plan != null) {
        switch (method) {
          case 'MOMO':
            break;
          case 'ZALOPAY':
            break;
          case 'VNPAY':
            const ipAddr =
              req.headers['x-forwarded-for'] || req.socket.remoteAddress;

            const createDate: string = moment().format('YYYYMMDDHHmmss');
            const orderId: string = moment().format('HHmmss');

            const queryParams = new URLSearchParams({
              vnp_Version: '2.1.0',
              vnp_Command: 'pay',
              vnp_TmnCode: process.env.VNP_TMNCODE!,
              vnp_Locale: req.body.language || 'vn',
              vnp_CurrCode: 'VND',
              vnp_TxnRef: orderId,
              vnp_OrderInfo: `Register subscription ${plan.order}: ${plan.name}`,
              vnp_OrderType: req.body.orderType || '190003',
              vnp_Amount: (plan.price! * 100).toString(),
              vnp_ReturnUrl:
                process.env.NODE_ENV == 'production'
                  ? process.env.APP_URL!
                  : 'http://localhost:3000',
              vnp_IpAddr: ipAddr!,
              vnp_CreateDate: createDate,
              // vnp_BankCode: req.body.bankCode || 'NCB',
            });

            let queryParams1: any = {
              vnp_Version: '2.1.0',
              vnp_Command: 'pay',
              vnp_TmnCode: process.env.VNP_TMNCODE!,
              vnp_Locale: req.body.language || 'vn',
              vnp_CurrCode: 'VND',
              vnp_TxnRef: orderId,
              vnp_OrderInfo: `Register subscription ${plan.order}: ${plan.name}`,
              vnp_OrderType: req.body.orderType || '190003',
              vnp_Amount: (plan.price! * 100).toString(),
              vnp_ReturnUrl:
                process.env.NODE_ENV == 'production'
                  ? process.env.APP_URL!
                  : 'http://localhost:3000',
              vnp_IpAddr: ipAddr!,
              vnp_CreateDate: createDate,
              // vnp_BankCode: req.body.bankCode || 'NCB',
            };

            const signed: string = cryptoJs
              .HmacSHA512(queryParams.toString(), process.env.VNP_HASHSECRET!)
              .toString(cryptoJs.enc.Hex);

            queryParams.set('vnp_SecureHash', signed);

            const signData = qs.stringify(queryParams1, { encode: false });

            const signed1: string = cryptoJs
              .HmacSHA512(signData, process.env.VNP_HASHSECRET!)
              .toString(cryptoJs.enc.Hex);

            queryParams1['vnp_SecureHash'] = signed1;

            const vnpParams = qs.stringify(queryParams1, { encode: false });

            // console.log(process.env.VNP_URL! + '?' + queryParams.toString());

            console.log(signed1);

            res.json({
              url: process.env.VNP_URL! + '?' + vnpParams,
            });

            // var querystring = require('qs');
            // var signData = querystring.stringify(queryParams, {
            //   encode: false,
            // });
            // var crypto = require('crypto');
            // var hmac = crypto.createHmac('sha512', process.env.VNP_HASHSECRET!);
            // var signed = hmac
            //   .update(new Buffer(signData, 'utf-8'))
            //   .digest('hex');
            // queryParams1['vnp_SecureHash'] = signed;

            // res.json({
            //   url:
            //     process.env.VNP_URL! +
            //     '?' +
            //     querystring.stringify(queryParams1, { encode: false }),
            // });

            break;
          case 'STRIPE':
            const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
              apiVersion: '2023-08-16',
            });

            const session = await stripe.checkout.sessions.create({
              payment_method_types: ['card'],
              mode: 'subscription',
              line_items: [
                {
                  price_data: {
                    currency: 'VND',
                    product_data: {
                      name: `VIP Phimhay247 gói cao cấp`,
                      description: `Nâng cấp tài khoản gói: ${plan.name}`,
                    },
                    unit_amount: plan.price!,
                    recurring: {
                      interval: 'month',
                    },
                  },
                  quantity: 1,
                },
              ],
              success_url:
                (process.env.NODE_ENV == 'production'
                  ? process.env.APP_URL!
                  : 'http://localhost:3000') + '/upgrade/state/StripeSuccess',

              cancel_url:
                (process.env.NODE_ENV == 'production'
                  ? process.env.APP_URL!
                  : 'http://localhost:3000') +
                '/upgrade/paymentpicker?planorder=' +
                plan.order,
            });

            console.log(session);

            res.json({
              url: session.url,
            });
            break;
          default:
            next(
              createHttpError.NotFound(
                `Register plan with method: ${method} is not support`
              )
            );
            break;
        }
      } else {
        next(createHttpError.NotFound(`Plan is not exist`));
      }
    } catch (error) {
      next(error);
    }
  }

  async retrieve(req: Request, res: Response, next: NextFunction) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2023-08-16',
      });

      const idSession: string = req.params.id;

      const session = await stripe.checkout.sessions.retrieve(idSession);
    } catch (error) {
      next(error);
    }
  }
}

export default new PlanController();
