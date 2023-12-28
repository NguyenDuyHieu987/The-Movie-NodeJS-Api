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
import Bill from '@/models/bill';
import Plan from '@/models/plan';
import Subscription from '@/models/subscription';
import type { PaymentMethods, user } from '@/types';

class SubscriptionController extends RedisCache {
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

  private async createCheckoutSession(
    req: Request,
    stripe: Stripe,
    plan: any,
    user: user
  ): Promise<string> {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer: user.email,
      // customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: 'VND',
            product_data: {
              name: `Nâng cấp VIP ${plan.vip}: Phimhay247 gói cao cấp`,
              description: `Nâng cấp tài khoản gói: ${plan.name}`,
              images: [],
              tax_code: 'txcd_10000000',
              metadata: {
                plan_id: plan.id
              }
            },
            unit_amount: plan.price!,
            recurring: {
              interval: 'month',
              interval_count: 1
            },
            tax_behavior: 'inclusive'
          },
          quantity: 1
        }
      ],
      metadata: {
        plan_id: plan.id
      },
      allow_promotion_codes: true,
      discounts: [
        {
          // coupon: '2023',
          // promotion_code: '2023',
        }
      ],
      subscription_data: {
        description: `Nâng cấp tài khoản gói: ${plan.name}`,
        trial_period_days: 30,
        trial_settings: {
          end_behavior: {
            missing_payment_method: 'pause'
          }
        },
        metadata: {
          plan_id: plan.id
        }
      },
      client_reference_id: user.id,
      // success_url:
      //   (process.env.NODE_ENV == 'production'
      //     ? process.env.CLIENT_URL!
      //     : req.headers.origin) +
      //   '/upgrade/state/StripeSuccess?session_id={CHECKOUT_SESSION_ID}',
      success_url:
        (process.env.NODE_ENV == 'production'
          ? process.env.APP_URL!
          : `http://${req.headers.host}`) +
        `/plan/stripe/retrieve/{CHECKOUT_SESSION_ID}`,
      cancel_url:
        (process.env.NODE_ENV == 'production'
          ? process.env.CLIENT_URL!
          : req.headers.origin) +
        '/upgrade/PaymentPicker?planorder=' +
        plan.order
    });

    const billId: string = uuidv4();

    const bill = await Bill.create({
      id: billId,
      account_id: session.client_reference_id,
      session_id: session.id,
      session,
      description: `Nâng cấp tài khoản gói: ${plan.name}`,
      unit: 1,
      unit_amount: plan.price!,
      amount_total: session.amount_total,
      amount_discount: 0,
      amount_tax: 0,
      currency: session.currency,
      status: 'pending',
      payment_status: 'unpaid',
      payment_method: 'stripe',
      url: session.url,
      success_url:
        (process.env.NODE_ENV == 'production'
          ? process.env.APP_URL!
          : `http://${req.headers.host}`) +
        `/plan/stripe/retrieve/${session.id}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    return session.url!;
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
              vnp_CreateDate: createDate
              // vnp_BankCode: req.body.bank_code || 'NCB',
            });

            const queryParams1: any = {
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
              vnp_CreateDate: createDate
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

            queryParams1.vnp_SecureHash = signed1;

            const vnpParams = qs.stringify(queryParams1, { encode: false });

            // console.log(process.env.VNP_URL! + '?' + queryParams.toString());

            // console.log(signed1);

            return res.json({
              url: process.env.VNP_URL! + '?' + vnpParams
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
              apiVersion: STRIPE_API_VERSION
            });

            // console.log(req.headers.host);
            // console.log(req.hostname);
            // console.log(req.headers.origin);

            const subscription = await Subscription.findOne({
              account_id: user.id
            });

            if (subscription != null) {
              return res.json({
                success: false,
                isRegistered: true,
                result: 'You have registered for a subscription'
              });
            }

            const session = await stripe.checkout.sessions.create({
              payment_method_types: ['card'],
              mode: 'subscription',
              customer: 'cus_PGTNwWCwjCoxnU',
              // customer_email: user.email,
              line_items: [
                {
                  price_data: {
                    currency: 'VND',
                    product_data: {
                      name: `Nâng cấp VIP ${plan.vip}: Phimhay247 gói cao cấp`,
                      description: `Nâng cấp tài khoản gói: ${plan.name}`,
                      images: [],
                      tax_code: 'txcd_10000000',
                      metadata: {
                        plan_id: plan.id
                      }
                    },
                    unit_amount: plan.price!,
                    recurring: {
                      interval: 'month',
                      interval_count: 1
                    },
                    tax_behavior: 'inclusive'
                  },
                  quantity: 1
                }
              ],
              metadata: {
                plan_id: plan.id
              },
              allow_promotion_codes: true,
              discounts: [
                {
                  // coupon: '2023',
                  // promotion_code: '2023',
                }
              ],
              subscription_data: {
                description: `Nâng cấp tài khoản gói: ${plan.name}`,
                trial_period_days: 30,
                trial_settings: {
                  end_behavior: {
                    missing_payment_method: 'pause'
                  }
                },
                metadata: {
                  plan_id: plan.id
                }
              },
              client_reference_id: user.id,
              // success_url:
              //   (process.env.NODE_ENV == 'production'
              //     ? process.env.CLIENT_URL!
              //     : req.headers.origin) +
              //   '/upgrade/state/StripeSuccess?session_id={CHECKOUT_SESSION_ID}',
              success_url:
                (process.env.NODE_ENV == 'production'
                  ? process.env.APP_URL!
                  : `http://${req.headers.host}`) +
                `/plan/stripe/retrieve/{CHECKOUT_SESSION_ID}`,
              cancel_url:
                (process.env.NODE_ENV == 'production'
                  ? process.env.CLIENT_URL!
                  : req.headers.origin) +
                '/upgrade/PaymentPicker?planorder=' +
                plan.order
            });

            const billId: string = uuidv4();

            const bill = await Bill.create({
              id: billId,
              account_id: session.client_reference_id,
              session_id: session.id,
              session,
              description: `Nâng cấp tài khoản gói: ${plan.name}`,
              unit: 1,
              unit_amount: plan.price!,
              amount_total: session.amount_total,
              amount_discount: 0,
              amount_tax: 0,
              currency: session.currency,
              status: 'pending',
              payment_status: 'unpaid',
              payment_method: 'stripe',
              url: session.url,
              success_url:
                (process.env.NODE_ENV == 'production'
                  ? process.env.APP_URL!
                  : `http://${req.headers.host}`) +
                `/plan/stripe/retrieve/${session.id}`,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

            return res.json({
              success: true,
              url: session.url
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
          const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
            apiVersion: STRIPE_API_VERSION
          });

          const session = await stripe.checkout.sessions.retrieve(
            sessionId,
            {}
          );

          const bill = await Bill.findOne({
            account_id: session.client_reference_id,
            session_id: sessionId
          });

          if (bill == null) {
            // return createHttpError.NotFound(`Can't find bill`);

            return res.json({
              success: false,
              billNotFound: true,
              result: `Can't find bill`
            });
          }

          if (bill.status == 'canceled') {
            return res.json({ success: false, status: bill.status });
          }

          if (session.status != 'complete') {
            if (session.status == 'open') {
              return res.json({
                success: false,
                status: session.status,
                url: session.url
              });
            }

            if (session.status == 'expired') {
              bill.status = 'expired';
              bill.session = session;

              await bill.save();
            }

            return res.json({ success: false, status: session.status });
          }

          if (session.payment_status == 'paid') {
            const subscription = await stripe.subscriptions.retrieve(
              session.subscription as string,
              {}
            );

            if (bill.status != 'complete') {
              const billId: string = uuidv4();

              const subscriptionId: string = uuidv4();

              const start_date = new Date(
                (subscription.start_date as number) * 1000
              ).toISOString();

              const end_date = new Date(
                (subscription.ended_at as number) * 1000
              ).toISOString();

              const trial_start = new Date(
                (subscription.trial_start as number) * 1000
              ).toISOString();

              const trial_end = new Date(
                (subscription.trial_end as number) * 1000
              ).toISOString();

              bill.session = session;
              bill.customer_id = session.customer as string;
              bill.subscription_id = subscriptionId;
              bill.subscription = subscription;
              bill.status = 'complete';
              bill.payment_status = 'paid';
              bill.customer_details = session.customer_details;
              bill.amount_total = session.amount_total;
              bill.amount_discount = session.total_details!.amount_discount;
              bill.amount_tax = session.total_details!.amount_tax;

              await bill.save();

              const result = await Subscription.create({
                id: subscriptionId,
                account_id: session.client_reference_id,
                subscription_id: subscription.id,
                subscription,
                customer_id: session.customer,
                plan_id: subscription.metadata.plan_id,
                status: subscription.status,
                latest_bill: bill.id
              });

              return res.json({
                success: true,
                session,
                subscription,
                date: trial_end
              });
            } else {
              if (bill.payment_status != 'paid') {
                bill.payment_status = 'paid';
              }

              await bill.save();

              return res.json({
                success: true,
                result: 'You have successfully registered for subscription'
              });
            }

            // const clientUrl =
            //   process.env.NODE_ENV == 'production'
            //     ? process.env.CLIENT_URL!
            //     : req.headers.origin! || process.env.CLIENT_DEV_URL!;

            // return res.redirect(clientUrl);
          } else {
            return res.json({
              success: false,
              payment_status: session.payment_status
            });
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

export default new SubscriptionController();
