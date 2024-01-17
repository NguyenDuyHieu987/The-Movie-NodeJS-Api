import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';

import Notification from '@/models/notification';
import type { User } from '@/types';

export class NotificationController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const skip: number = +req.query.skip! - 1 || 0;
      const limit: number = +req.query.limit! || 20;

      const userToken = res.locals.userToken;
      const user = res.locals.user as User;

      const notifications = await Notification.find({
        user_id: user.id
      })
        .skip(skip * limit)
        .limit(limit)
        .sort({ created_at: -1 });

      return res.json(notifications);
    } catch (error) {
      return next(error);
    }
  }
}

export default new NotificationController();
