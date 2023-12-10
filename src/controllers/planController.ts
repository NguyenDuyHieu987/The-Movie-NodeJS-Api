import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import fetch from 'node-fetch';
import Plan from '@/models/plan';
import Bill from '@/models/bill';
import RedisCache from '@/config/redis';
import moment from 'moment';
import cryptoJs from 'crypto-js';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import type { user, PaymentMethods } from '@/types';
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

      return res.json(response);
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

      const method: PaymentMethods = req.body.method?.toUpperCase();

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
              vnp_OrderType: req.body.order_type || '190003',
              vnp_Amount: (plan.price! * 100).toString(),
              vnp_ReturnUrl:
                process.env.NODE_ENV == 'production'
                  ? process.env.CLIENT_URL!
                  : req.headers.origin!,
              vnp_IpAddr: ipAddr!,
              vnp_CreateDate: createDate,
              // vnp_BankCode: req.body.bank_code || 'NCB',
            });

            let queryParams1: any = {
              vnp_Version: '2.1.0',
              vnp_Command: 'pay',
              vnp_TmnCode: process.env.VNP_TMNCODE!,
              vnp_Locale: req.body.language || 'vn',
              vnp_CurrCode: 'VND',
              vnp_TxnRef: orderId,
              vnp_OrderInfo: `Register subscription ${plan.order}: ${plan.name}`,
              vnp_OrderType: req.body.order_type || '190003',
              vnp_Amount: plan.price! * 100,
              vnp_ReturnUrl:
                process.env.NODE_ENV == 'production'
                  ? process.env.CLIENT_URL!
                  : req.headers.origin!,
              vnp_IpAddr: ipAddr!,
              vnp_CreateDate: createDate,
              // vnp_BankCode: req.body.bank_code || 'NCB',
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

            // console.log(signed1);

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
              apiVersion: '2023-10-16',
            });

            const session = await stripe.checkout.sessions.create({
              payment_method_types: ['card'],
              mode: 'subscription',
              line_items: [
                {
                  price_data: {
                    currency: 'VND',
                    product_data: {
                      name: `Nâng cấp VIP ${plan.order}: Phimhay247 gói cao cấp`,
                      description: `Nâng cấp tài khoản gói: ${plan.name}`,
                      images: [],
                    },
                    unit_amount: plan.price!,
                    recurring: {
                      interval: 'month',
                    },
                  },
                  quantity: 1,
                },
              ],
              allow_promotion_codes: true,
              discounts: [
                {
                  // coupon: '2023',
                  // promotion_code: '2023',
                },
              ],
              subscription_data: {
                description: `Nâng cấp tài khoản gói: ${plan.name}`,
                trial_period_days: 7,
                trial_settings: {
                  end_behavior: {
                    missing_payment_method: 'pause',
                  },
                },
              },
              client_reference_id: user.id,
              customer_email: user.email,
              // success_url:
              //   (process.env.NODE_ENV == 'production'
              //     ? process.env.CLIENT_URL!
              //     : 'http://localhost:3000') +
              //   '/upgrade/state/StripeSuccess?session_id={CHECKOUT_SESSION_ID}',
              success_url:
                (process.env.NODE_ENV == 'production'
                  ? process.env.APP_URL!
                  : `http://${req.headers.host}`) +
                '/plan/stripe/retrieve/{CHECKOUT_SESSION_ID}',
              cancel_url:
                (process.env.NODE_ENV == 'production'
                  ? process.env.CLIENT_URL!
                  : req.headers.origin) +
                '/upgrade/PaymentPicker?planorder=' +
                plan.order,
            });

            // console.log(req.headers.host);
            // console.log(req.hostname);
            // console.log(req.headers.origin);

            res.json({
              url: session.url,
            });
            break;
          default:
            return next(
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
        apiVersion: '2023-10-16',
      });

      const method: PaymentMethods | string = req.params.method?.toUpperCase();
      const sessionId: string = req.params.id;

      switch (method) {
        case 'MOMO':
          break;
        case 'ZALOPAY':
          break;
        case 'VNPAY':
          break;
        case 'STRIPE':
          const session = await stripe.checkout.sessions.retrieve(
            sessionId,
            {}
          );

          if (session.payment_status == 'paid') {
            // const result = await Bill.create({});

            return res.json(session);

            // const clientUrl =
            //   process.env.NODE_ENV == 'production'
            //     ? process.env.CLIENT_URL!
            //     : req.headers.origin! || process.env.CLIENT_DEV_URL!;

            // return res.redirect(clientUrl);
          } else {
            res.json({ status: 'unpaid' });
          }

          break;
        default:
          return next(
            createHttpError.NotFound(
              `Retrieve a checkout session with method: ${method} is not support`
            )
          );
          break;
      }
    } catch (error) {
      next(error);
    }
  }
}

export default new PlanController();
