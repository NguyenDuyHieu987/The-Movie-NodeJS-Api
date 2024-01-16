import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';

import Notification from '@/models/notification';
import type { User } from '@/types';

class NotificationController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const skip: number = +req.query.skip! - 1 || 0;
      const limit: number = +req.query.limit! || 20;

      const user_token =
        req.cookies.user_token ||
        req.headers.authorization!.replace('Bearer ', '');

      const user = jwt.verify(
        user_token,
        process.env.JWT_SIGNATURE_SECRET!
      ) as User;

      const notifications = await Notification.find({
        user_id: user.id
      })
        .skip(skip * limit)
        .limit(limit)
        .sort({ created_at: -1 });

      return res.json(notifications);
    } catch (error) {
      if (
        error instanceof jwt.TokenExpiredError ||
        error instanceof jwt.JsonWebTokenError
      ) {
        res.clearCookie('user_token', {
          domain: req.hostname,
          httpOnly: req.session.cookie.httpOnly,
          sameSite: req.session.cookie.sameSite,
          secure: true
        });
      }
      return next(error);
    }
  }
}

export default new NotificationController();
