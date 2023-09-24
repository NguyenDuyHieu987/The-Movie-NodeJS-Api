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
      const user_token =
        req.cookies.user_token ||
        req.headers.authorization!.replace('Bearer ', '');

      const user = jwt.verify(
        user_token,
        process.env.JWT_SIGNATURE_SECRET!
      ) as user;

      const planId: string = req.params.id;
      const plan = await Plan.findOne({ id: planId });

      if (plan != null) {
        const ipAddr =
          req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        const createDate = moment().format('YYYYMMDDHHmmss');
        const orderId = moment().format('HHmmss');

        const queryParams = new URLSearchParams({
          vnp_Version: '2.1.0',
          vnp_Command: 'pay',
          vnp_TmnCode: process.env.VNP_TMNCODE!,
          vnp_Locale: req.body.language || 'vn',
          vnp_CurrCode: 'VND',
          vnp_TxnRef: orderId,
          vnp_OrderInfo: `Register subscription ${plan.order}`,
          vnp_OrderType: req.body.orderType || '190003',
          vnp_Amount: (plan.price! * 100).toString(),
          vnp_ReturnUrl: process.env.APP_URL!,
          vnp_IpAddr: ipAddr!,
          vnp_CreateDate: createDate,
          // vnp_BankCode: req.body.bankCode || 'NCB',
        });

        console.log(queryParams.toString());

        const signed = cryptoJs
          .HmacSHA512(queryParams.toString(), process.env.VNP_HASHSECRET!)
          .toString(cryptoJs.enc.Hex);

        queryParams.set('vnp_SecureHash', signed);

        // const VNPayOrderResponse: any = await fetch(
        //   process.env.VNP_URL! + '?' + queryParams
        // ).then((res) => res.json());

        console.log(process.env.VNP_URL! + '?' + queryParams.toString());
      } else {
        next(createHttpError.NotFound(`Plan is not exist`));
      }
    } catch (error) {
      next(error);
    }
  }
}

export default new PlanController();
