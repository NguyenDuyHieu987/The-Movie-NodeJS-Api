import * as argon2 from 'argon2';
import type { CookieOptions, NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import type { JwtPayload } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

import { ONE_DAY, ONE_HOUR, ONE_MINUTE } from '@/common';
import { RedisCache } from '@/config/redis';
import { APP_TOKEN_SECRET } from '@/constants';
import Account from '@/models/account';
import type { User } from '@/types';
import ValidateEmail from '@/utils/emailValidation';
import { encryptPassword } from '@/utils/encryptPassword';
import GenerateOTP from '@/utils/generateOTP';
import {
  JWT_ALGORITHM_DEFAULT,
  JWT_ALLOWED_ALGORITHMS,
  signDefaultToken,
  signRefreshToken,
  signUserToken,
  verifyDefaultToken
} from '@/utils/jwt';
import jwtRedis from '@/utils/jwtRedis';
import sendinblueEmail from '@/utils/sendinblueEmail';
import { UpdateWriteOpResult } from 'mongoose';
import dayjs from 'dayjs';
// import { GraphQLClient, gql } from 'graphql-request';
import { google } from 'googleapis';
import { oauth2Client } from '@/config/google';
import { TOKEN } from '@/common/token';

export class AccountController extends RedisCache {
  constructor() {
    super();
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const key: string = req.originalUrl;

      const data = await Account.find();

      const response = { results: data };

      return res.json(response);
    } catch (error) {
      return next(error);
    }
  }

  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const query: string = (req.query.query as string) || '';
      const key: string = req.originalUrl;

      const data = await Account.find({
        $or: [
          { username: { $regex: query, $options: 'i' } },
          {
            full_name: { $regex: query, $options: 'i' }
          },
          {
            email: { $regex: query, $options: 'i' }
          }
        ]
      });

      const response = { results: data };

      return res.json(response);
    } catch (error) {
      return next(error);
    }
  }

  async getStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      const key: string = req.originalUrl;
      const startOfDayQuery: string =
        (req.query.startOfDay as string) || dayjs().format('YYYY-MM-DD');
      const endOfDayQuery: string =
        (req.query.endOfDay as string) || dayjs().format('YYYY-MM-DD');

      const startOfDay = new Date(startOfDayQuery);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(endOfDayQuery);
      endOfDay.setHours(23, 59, 59, 999);

      const periodInDays = dayjs(startOfDay).diff(dayjs(endOfDay), 'day');

      const startDateLastPeriod = dayjs(startOfDay).subtract(
        periodInDays,
        'day'
      );
      const endDateLastPeriod = dayjs(endOfDay).subtract(periodInDays, 'day');

      const data = await Account.find({
        created_at: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      });

      const dataLastPeriod = await Account.find({
        created_at: {
          $gte: startDateLastPeriod.toDate(),
          $lte: endDateLastPeriod.toDate()
        }
      });

      const total = await Account.countDocuments();

      const CLOUDFLARE_API_URL =
        'https://api.cloudflare.com/client/v4/graphql/';
      // const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
      // const ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;
      const ZONE_ID = 'cd6053fef7ddad92250a7e945cf89765';
      const API_TOKEN = '_eZImi8Mhn2hMK3wOz-2UpR22y0IQA146fXX__lg';

      // const graphQLClient = new GraphQLClient(CLOUDFLARE_API_URL, {
      //   headers: {
      //     Authorization: `Bearer ${API_TOKEN}`,
      //     'Content-Type': 'application/json'
      //   }
      // });

      // const GET_ANALYTICS_QUERY = gql`
      //   query ($zoneTag: String!) {
      //     viewer {
      //       zones(filter: { zoneTag: $zoneTag }) {
      //         firewallEventsAdaptive(
      //           filter: { datetime_gt: $start, datetime_lt: $end }
      //           limit: 2
      //           orderBy: [datetime_DESC]
      //         ) {
      //           action
      //           datetime
      //           host: clientRequestHTTPHost
      //         }
      //       }
      //     }
      //   }
      // `;
      // const variables = {
      //   zoneTag: ZONE_ID,
      //   start: '2025-01-03T02:07:05Z',
      //   end: '2025-01-03T17:07:05Z'
      // };

      // const Analytics = await graphQLClient.request(
      //   GET_ANALYTICS_QUERY,
      //   variables
      // );

      const response = {
        numberUser: data.length,
        numberUserLastPeriod: dataLastPeriod.length,
        totalUser: total
      };

      return res.json(response);
    } catch (error) {
      return next(error);
    }
  }

  async getReports(req: Request, res: Response, next: NextFunction) {
    try {
      const key: string = req.originalUrl;
      const startOfDayQuery: string =
        (req.query.startOfDay as string) || dayjs().format('YYYY-MM-DD');
      const endOfDayQuery: string =
        (req.query.endOfDay as string) || dayjs().format('YYYY-MM-DD');

      // const startOfDay = new Date(startOfDayQuery);
      // startOfDay.setHours(0, 0, 0, 0);
      // const endOfDay = new Date(endOfDayQuery);
      // endOfDay.setHours(23, 59, 59, 999);

      // Lấy ngày bắt đầu và ngày kết thúc của khoảng thời gian 7 ngày gần đây
      const startOfDay = dayjs(startOfDayQuery)
        .subtract(6, 'day')
        .startOf('day'); // 6 ngày trước, bao gồm ngày hiện tại
      const endOfDay = dayjs(endOfDayQuery).endOf('day');

      const periodInDays = dayjs(startOfDay).diff(dayjs(endOfDay), 'day');

      const startDateLastPeriod = dayjs(startOfDay).subtract(
        periodInDays,
        'day'
      );
      const endDateLastPeriod = dayjs(endOfDay).subtract(periodInDays, 'day');

      const allDays = Array.from({ length: 7 }).map((_, i) =>
        startOfDay.add(i, 'day').format('YYYY-MM-DD')
      );

      const data = await Account.aggregate([
        // 1. Lọc user được tạo trong 7 ngày gần đây
        {
          $match: {
            createdAt: {
              $gte: new Date(new Date().setDate(new Date().getDate() - 7)), // 7 ngày trước
              $lte: new Date() // Ngày hiện tại
            }
          }
        },
        // 2. Lấy ngày từ `createdAt` (bỏ giờ)
        {
          $project: {
            day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
          }
        },
        // 3. Đếm số lượng user được tạo theo ngày
        {
          $group: {
            _id: '$day', // Group by ngày
            count: { $sum: 1 } // Đếm số lượng user
          }
        },
        // 4. Sắp xếp theo ngày tăng dần
        {
          $sort: {
            _id: 1
          }
        }
      ]);

      // Đưa dữ liệu về dạng Object với key là ngày
      const dataMap = data.reduce((acc: Record<string, number>, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {});

      // Kết hợp kết quả với danh sách tất cả các ngày
      const results = allDays.map((day) => ({
        day: day,
        count: dataMap[day] || 0
      }));

      const response = {
        results: results
      };

      return res.json(response);
    } catch (error) {
      return next(error);
    }
  }

  async confirm(req: Request, res: Response, next: NextFunction) {
    try {
      const userToken = res.locals.userToken;
      const user = res.locals.user as User;

      const formUser = req.body;

      const OTP: string = GenerateOTP({ length: 6 });
      let encoded: string = '';
      let emailResponse: any = null;

      console.log(OTP);

      switch (req.params.type) {
        case 'email':
          const vrfEmailToken = req.cookies[TOKEN.NAME.COOKIE_VRF_EMAIL_TOKEN];

          encoded = await signDefaultToken(
            {
              id: user.id,
              email: user.email,
              auth_type: 'email',
              description: 'Verify your Email',
              exp:
                Math.floor(Date.now() / 1000) +
                +process.env.OTP_EXP_OFFSET! * ONE_MINUTE
            },
            {
              signature: OTP,
              algorithm: JWT_ALGORITHM_DEFAULT,
              // expiresIn: +process.env.OTP_EXP_OFFSET! * ONE_MINUTE + 's',
              prefix: TOKEN.NAME.COOKIE_VRF_EMAIL_TOKEN,
              oldToken: vrfEmailToken
            }
          );

          emailResponse = await sendinblueEmail.VerificationOTP({
            to: user.email,
            otp: OTP,
            title: 'Xác nhận Email của bạn',
            noteExp: +process.env.OTP_EXP_OFFSET!
          });

          res.cookie(TOKEN.NAME.COOKIE_VRF_EMAIL_TOKEN, encoded, {
            ...(req.session.cookie as CookieOptions),
            domain: req.session.cookie.domain,
            httpOnly: req.session.cookie.httpOnly,
            sameSite: req.session.cookie.sameSite,
            secure: true,
            maxAge: +process.env.OTP_EXP_OFFSET! * ONE_MINUTE * 1000
          });
          break;
        case 'change-password':
          const account = await Account.findOne({
            email: user.email,
            auth_type: 'email',
            status: 'active'
          });

          if (account == null) {
            throw createHttpError.NotFound(`Account is not found`);
          }

          const isCorrectPassword = await argon2.verify(
            account.password!,
            formUser.old_password
            // {
            //    secret: Buffer.from(APP_TOKEN_SECRET),
            // }
          );

          if (!isCorrectPassword) {
            return res.json({
              isWrongPassword: true,
              result: 'Wrong password'
            });
          }

          const newPasswordEncrypted = await encryptPassword(
            formUser.new_password
          );

          const oldChgPwdToken =
            req.cookies[TOKEN.NAME.COOKIE_CHG_PASSWORD_TOKEN];

          encoded = await signDefaultToken(
            {
              id: user.id,
              email: user.email,
              auth_type: 'email',
              new_password: newPasswordEncrypted,
              logout_all_device: formUser.logout_all_device == 'true',
              description: 'Change your password',
              exp:
                Math.floor(Date.now() / 1000) +
                +process.env.OTP_EXP_OFFSET! * ONE_MINUTE
            },
            {
              signature: OTP,
              algorithm: JWT_ALGORITHM_DEFAULT,
              // expiresIn: +process.env.OTP_EXP_OFFSET! * ONE_MINUTE + 's',
              prefix: TOKEN.NAME.COOKIE_CHG_PASSWORD_TOKEN,
              oldToken: oldChgPwdToken
            }
          );

          emailResponse = await sendinblueEmail.VerificationOTP({
            to: user.email,
            otp: OTP,
            title: 'Xác nhận thay đổi mật khẩu của bạn',
            noteExp: +process.env.OTP_EXP_OFFSET!
          });

          res.cookie(TOKEN.NAME.COOKIE_CHG_PASSWORD_TOKEN, encoded, {
            ...(req.session.cookie as CookieOptions),
            domain: req.session.cookie.domain,
            httpOnly: req.session.cookie.httpOnly,
            sameSite: req.session.cookie.sameSite,
            secure: true,
            maxAge: +process.env.OTP_EXP_OFFSET! * ONE_MINUTE * 1000
          });

          break;
        case 'change-email':
          const account1 = await Account.findOne({
            email: formUser.new_email,
            auth_type: 'email'
          });

          if (account1 != null) {
            return res.json({
              isEmailExist: true,
              result: 'Email is already exists'
            });
          }

          if (!(await ValidateEmail(formUser.new_email))) {
            // if (true) {

            return res.json({
              isInValidEmail: true,
              result: 'Email is Invalid'
            });
          }

          const oldChgEmailToken =
            req.cookies[TOKEN.NAME.COOKIE_CHG_EMAIL_TOKEN];

          encoded = await signDefaultToken(
            {
              id: user.id,
              email: user.email,
              auth_type: 'email',
              new_email: formUser.new_email,
              description: 'Change your email',
              exp:
                Math.floor(Date.now() / 1000) +
                +process.env.CHANGE_EMAIL_EXP_OFFSET! * ONE_MINUTE
            },
            {
              prefix: TOKEN.NAME.COOKIE_CHG_EMAIL_TOKEN,
              oldToken: oldChgEmailToken
            }
          );

          const clientUrl =
            process.env.NODE_ENV == 'production'
              ? process.env.CLIENT_URL!
              : req.headers.origin;

          const changeEmailLink = `${clientUrl}/ChangeEmail?token=${encoded}`;

          console.log(changeEmailLink);

          emailResponse = await sendinblueEmail.VerificationLink({
            to: formUser.new_email,
            title: 'Thay đổi email của bạn',
            subject: 'Hoàn tất yêu cầu thay đổi email',
            nameLink: 'Thay đổi email',
            linkVerify: changeEmailLink,
            note1: 'Truy cập dường liên kết sau đây để thay đổi email của bạn:',
            noteExp: +process.env.CHANGE_EMAIL_EXP_OFFSET!
          });

          res.cookie(TOKEN.NAME.COOKIE_CHG_EMAIL_TOKEN, encoded, {
            ...(req.session.cookie as CookieOptions),
            domain: req.session.cookie.domain,
            httpOnly: req.session.cookie.httpOnly,
            sameSite: req.session.cookie.sameSite,
            secure: true,
            maxAge: +process.env.CHANGE_EMAIL_EXP_OFFSET! * ONE_MINUTE * 1000
          });

          return res.json({
            isSended: true,
            exp_offset: +process.env.CHANGE_EMAIL_EXP_OFFSET! * ONE_MINUTE,
            result: 'Send email successfully'
          });

        default:
          return next(
            createHttpError.NotFound(
              `Verify account with type ${req.params.type} not found`
            )
          );
      }
    } catch (error) {
      return next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userToken = res.locals.userToken;
      const user = res.locals.user as User;

      const verifyToken = req.cookies[TOKEN.NAME.COOKIE_CHG_PASSWORD_TOKEN];

      if (!verifyToken) {
        return next(createHttpError.BadRequest('Token is required'));
      }

      const decodeChangePassword = (await verifyDefaultToken(verifyToken, {
        signature: req.body.otp,
        prefix: TOKEN.NAME.COOKIE_CHG_PASSWORD_TOKEN
      })) as JwtPayload;

      const result = await Account.updateOne(
        {
          id: user.id,
          email: user.email,
          auth_type: 'email'
        },
        {
          $set: {
            password: decodeChangePassword.new_password
          }
        }
      );

      if (result.modifiedCount != 1) {
        return res.json({
          success: false,
          result: 'Change password failed'
        });
      }

      jwtRedis.setRevokePrefix(TOKEN.NAME.COOKIE_CHG_PASSWORD_TOKEN);

      await jwtRedis.sign(verifyToken, {
        EX: +process.env.OTP_EXP_OFFSET! * ONE_MINUTE
      });

      res.clearCookie(TOKEN.NAME.COOKIE_CHG_PASSWORD_TOKEN, {
        ...(req.session.cookie as CookieOptions),
        domain: req.session.cookie.domain,
        httpOnly: req.session.cookie.httpOnly,
        sameSite: req.session.cookie.sameSite,
        secure: true
      });

      if (decodeChangePassword.logout_all_device) {
        // await RedisCache.client.del(`${TOKEN.NAME.REFRESH_TOKEN}__${req.cookies.refresh_token}`);

        const accountInfo = {
          id: user.id,
          username: user.username,
          email: user.email,
          full_name: user.full_name,
          avatar: user.avatar,
          role: user.role,
          auth_type: user.auth_type,
          created_at: user.created_at
        };

        const newUserToken = await signUserToken(accountInfo);

        const newRefreshToken = await signRefreshToken(accountInfo);

        res.set('Access-Control-Expose-Headers', 'Authorization');

        res.cookie(TOKEN.NAME.USER_TOKEN, newUserToken, {
          ...(req.session.cookie as CookieOptions),
          domain: req.session.cookie.domain,
          httpOnly: req.session.cookie.httpOnly,
          sameSite: req.session.cookie.sameSite,
          secure: true,
          maxAge: +process.env.JWT_ACCESS_EXP_OFFSET! * ONE_HOUR * 1000
        });

        res.cookie(TOKEN.NAME.REFRESH_TOKEN, newRefreshToken, {
          ...(req.session.cookie as CookieOptions),
          domain: req.session.cookie.domain,
          httpOnly: req.session.cookie.httpOnly,
          sameSite: req.session.cookie.sameSite,
          secure: true,
          maxAge: +process.env.JWT_REFRESH_EXP_OFFSET! * ONE_DAY * 1000
        });

        res.header('Authorization', newUserToken);
      }

      return res.json({
        success: true,
        logout_all_device: decodeChangePassword.logout_all_device,
        result: 'Change password successfully'
      });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.json({
          isOTPExpired: true,
          result: 'OTP is expired'
        });
      }

      if (error instanceof jwt.JsonWebTokenError) {
        return res.json({
          isInvalidOTP: true,
          result: 'OTP is invalid'
        });
      }

      return next(error);
    }
  }

  async changeFullName(req: Request, res: Response, next: NextFunction) {
    try {
      const userToken = res.locals.userToken;
      const user = res.locals.user as User;

      if (!req.body?.new_full_name || req.body?.new_full_name.length == 0) {
        return res.json({
          success: false,
          result: 'Full name is required'
        });
      }

      const account = await Account.findOneAndUpdate(
        {
          id: user.id,
          email: user.email,
          username: user.username,
          full_name: user.full_name,
          auth_type: user.auth_type
        },
        {
          $set: {
            full_name: req.body.new_full_name
          }
        },
        { returnDocument: 'after' }
      );

      if (account == null) {
        return res.json({
          success: false,
          result: 'Cant not find information of account'
        });
      }

      const newUserToken = await signUserToken({
        id: account.id,
        username: account.username,
        email: account.email,
        full_name: account.full_name,
        avatar: account.avatar,
        role: account.role,
        auth_type: account.auth_type,
        created_at: account.created_at
      });

      res.set('Access-Control-Expose-Headers', 'Authorization');

      res.cookie(TOKEN.NAME.USER_TOKEN, newUserToken, {
        ...(req.session.cookie as CookieOptions),
        domain: req.session.cookie.domain,
        httpOnly: req.session.cookie.httpOnly,
        sameSite: req.session.cookie.sameSite,
        secure: true,
        maxAge: +process.env.JWT_ACCESS_EXP_OFFSET! * ONE_HOUR * 1000
      });

      res.header('Authorization', newUserToken);

      return res.json({
        success: true,
        result: 'Change full name successfully'
      });
    } catch (error) {
      return next(error);
    }
  }

  async changeAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      const userToken = res.locals.userToken;
      const user = res.locals.user as User;

      if (!req.body?.avatar || req.body?.avatar.length == 0) {
        return res.json({
          success: false,
          result: 'Avatar is required'
        });
      }

      const account = await Account.findOneAndUpdate(
        {
          id: user.id,
          email: user.email,
          username: user.username,
          full_name: user.full_name,
          auth_type: user.auth_type
        },
        {
          $set: {
            avatar: req.body.avatar
          }
        },
        { returnDocument: 'after' }
      );

      if (account == null) {
        return res.json({
          success: false,
          result: 'Cant not find information of account'
        });
      }

      const newUserToken = await signUserToken({
        id: account.id,
        username: account.username,
        email: account.email,
        full_name: account.full_name,
        avatar: account.avatar,
        role: account.role,
        auth_type: account.auth_type,
        created_at: account.created_at
      });

      res.set('Access-Control-Expose-Headers', 'Authorization');

      res.cookie(TOKEN.NAME.USER_TOKEN, newUserToken, {
        ...(req.session.cookie as CookieOptions),
        domain: req.session.cookie.domain,
        httpOnly: req.session.cookie.httpOnly,
        sameSite: req.session.cookie.sameSite,
        secure: true,
        maxAge: +process.env.JWT_ACCESS_EXP_OFFSET! * ONE_HOUR * 1000
      });

      res.header('Authorization', newUserToken);

      return res.json({
        success: true,
        result: 'Change full name successfully'
      });
    } catch (error) {
      return next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const userToken = res.locals.userToken;
      const user = res.locals.user as User;

      const verifyToken = req.cookies[TOKEN.NAME.COOKIE_VRF_EMAIL_TOKEN];

      if (!verifyToken) {
        return next(createHttpError.BadRequest('Token is required'));
      }

      const decoded = await verifyDefaultToken(verifyToken, {
        signature: req.body.otp,
        prefix: TOKEN.NAME.COOKIE_VRF_EMAIL_TOKEN
      });

      res.clearCookie(TOKEN.NAME.COOKIE_VRF_EMAIL_TOKEN, {
        ...(req.session.cookie as CookieOptions),
        domain: req.session.cookie.domain,
        httpOnly: req.session.cookie.httpOnly,
        sameSite: req.session.cookie.sameSite,
        secure: true
      });

      return res.json({ success: true });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.json({
          isOTPExpired: true,
          result: 'OTP is expired'
        });
      }

      if (error instanceof jwt.JsonWebTokenError) {
        return res.json({
          isInvalidOTP: true,
          result: 'OTP is invalid'
        });
      }

      return next(error);
    }
  }

  async changeEmailRetrieveToken(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const token: string = req.cookies[TOKEN.NAME.COOKIE_CHG_EMAIL_TOKEN];

      if (!token) {
        return next(createHttpError.BadRequest('Token is required'));
      }

      const changeEmailInfo = (await verifyDefaultToken(token, {
        prefix: TOKEN.NAME.COOKIE_CHG_EMAIL_TOKEN
      })) as JwtPayload;

      const account = await Account.findOne({
        id: changeEmailInfo.id,
        email: changeEmailInfo.email,
        auth_type: changeEmailInfo.auth_type,
        status: 'active'
      });

      if (account == null) {
        return res.json({
          success: false,
          result: 'Cant not find information of account'
        });
      }

      return res.json({
        success: true,
        result: {
          old_email: changeEmailInfo.email,
          new_email: changeEmailInfo.new_email
        }
      });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.json({
          isTokenExpired: true,
          result: 'Token is expired'
        });
      }

      if (error instanceof jwt.JsonWebTokenError) {
        return res.json({
          isInvalidToken: true,
          result: 'Token is invalid'
        });
      }

      return next(error);
    }
  }

  async changeEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const userToken = res.locals.userToken;
      const user = res.locals.user as User;
      const token: string = req.cookies[TOKEN.NAME.COOKIE_CHG_EMAIL_TOKEN];

      if (!token) {
        return next(createHttpError.BadRequest('Token is required'));
      }

      const changeEmailInfo = (await verifyDefaultToken(token, {
        prefix: TOKEN.NAME.COOKIE_CHG_EMAIL_TOKEN
      })) as JwtPayload;

      const account = await Account.findOneAndUpdate(
        {
          id: changeEmailInfo.id,
          email: changeEmailInfo.email,
          auth_type: changeEmailInfo.auth_type
        },
        {
          $set: {
            email: changeEmailInfo.new_email
          }
        },
        { returnDocument: 'after' }
      );

      if (account == null) {
        return res.json({
          success: false,
          result: 'Cant not find information of account'
        });
      }

      jwtRedis.setRevokePrefix(TOKEN.NAME.COOKIE_CHG_EMAIL_TOKEN);

      await jwtRedis.sign(token, {
        EX: +process.env.CHANGE_EMAIL_EXP_OFFSET! * ONE_MINUTE
      });

      const newUserToken = await signUserToken({
        id: account.id,
        username: account.username,
        email: account.email,
        full_name: account.full_name,
        avatar: account.avatar,
        role: account.role,
        auth_type: account.auth_type,
        created_at: account.created_at
      });

      res.set('Access-Control-Expose-Headers', 'Authorization');

      res.cookie(TOKEN.NAME.USER_TOKEN, newUserToken, {
        ...(req.session.cookie as CookieOptions),
        domain: req.session.cookie.domain,
        httpOnly: req.session.cookie.httpOnly,
        sameSite: req.session.cookie.sameSite,
        secure: true,
        maxAge: +process.env.JWT_ACCESS_EXP_OFFSET! * ONE_HOUR * 1000
      });

      res.clearCookie(TOKEN.NAME.COOKIE_CHG_EMAIL_TOKEN, {
        ...(req.session.cookie as CookieOptions),
        domain: req.session.cookie.domain,
        httpOnly: req.session.cookie.httpOnly,
        sameSite: req.session.cookie.sameSite,
        secure: true
      });

      res.header('Authorization', newUserToken);

      return res.json({
        success: true,
        result: 'Change email successfully'
      });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.json({
          isTokenExpired: true,
          result: 'Token is expired'
        });
      }

      if (error instanceof jwt.JsonWebTokenError) {
        return res.json({
          isInvalidToken: true,
          result: 'Token is invalid'
        });
      }

      return next(error);
    }
  }

  async resetPasswordRetrieveToken(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const token: string = req.cookies[TOKEN.NAME.COOKIE_RST_PASSWORD_TOKEN];

      if (!token) {
        return next(createHttpError.BadRequest('Token is required'));
      }

      const resetPasswordInfo = (await verifyDefaultToken(token, {
        prefix: TOKEN.NAME.COOKIE_RST_PASSWORD_TOKEN
      })) as JwtPayload;

      const account = await Account.findOne({
        id: resetPasswordInfo.id,
        email: resetPasswordInfo.email,
        auth_type: resetPasswordInfo.auth_type,
        status: 'active'
      });

      if (account == null) {
        return res.json({
          success: false,
          result: 'Cant not find information of account'
        });
      }

      return res.json({
        success: true,
        result: {
          username: account.username,
          email: resetPasswordInfo.email,
          auth_type: resetPasswordInfo.auth_type,
          created_at: account.created_at
        }
      });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.json({
          isTokenExpired: true,
          result: 'Token is expired'
        });
      }

      if (error instanceof jwt.JsonWebTokenError) {
        return res.json({
          isInvalidToken: true,
          result: 'Token is invalid'
        });
      }

      return next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const token: string = req.cookies[TOKEN.NAME.COOKIE_RST_PASSWORD_TOKEN];

      if (!token) {
        return next(createHttpError.BadRequest('Token is required'));
      }

      const resetPasswordInfo = (await verifyDefaultToken(token, {
        prefix: TOKEN.NAME.COOKIE_RST_PASSWORD_TOKEN
      })) as JwtPayload;

      const newPasswordEncrypted = await encryptPassword(req.body.new_password);

      const account = await Account.findOneAndUpdate(
        {
          id: resetPasswordInfo.id,
          email: resetPasswordInfo.email,
          auth_type: resetPasswordInfo.auth_type
        },
        {
          $set: {
            password: newPasswordEncrypted
          }
        },
        { returnDocument: 'after' }
      );

      if (account == null) {
        return res.json({
          success: false,
          result: 'Cant not find information of account'
        });
      }

      jwtRedis.setRevokePrefix(TOKEN.NAME.COOKIE_RST_PASSWORD_TOKEN);

      await jwtRedis.sign(token, {
        EX: +process.env.FORGOT_PASSWORD_EXP_OFFSET! * ONE_MINUTE
      });

      res.clearCookie(TOKEN.NAME.COOKIE_RST_PASSWORD_TOKEN, {
        ...(req.session.cookie as CookieOptions),
        domain: req.session.cookie.domain,
        httpOnly: req.session.cookie.httpOnly,
        sameSite: req.session.cookie.sameSite,
        secure: true
      });

      const isLogOutAllDevice = req.body.logout_all_device == 'true';

      if (isLogOutAllDevice) {
        // await RedisCache.client.del(`${TOKEN.NAME.REFRESH_TOKEN}__${req.cookies.refresh_token}`);
      }

      return res.json({
        success: true,
        result: 'Reset password successfully'
      });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.json({
          isTokenExpired: true,
          result: 'Token is expired'
        });
      }

      if (error instanceof jwt.JsonWebTokenError) {
        return res.json({
          isInvalidToken: true,
          result: 'Token is invalid'
        });
      }
      return next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const formData: User = req.body;

      if (!formData) {
        throw createHttpError.InternalServerError(
          'Please provide full account information'
        );
      }

      const account = await Account.findOne({ email: req.body.email });

      if (account != null) {
        return res.json({
          success: false,
          message: `Account already exists`
        });
      }

      const account1 = await Account.findOne({ username: req.body.username });

      if (account1 != null) {
        return res.json({
          success: false,
          message: `Username already exists`
        });
      }

      const id: string = uuidv4();

      const passwordEncrypted = await encryptPassword(formData.password);

      const result = await Account.create({
        id: id,
        ...req.body,
        password: passwordEncrypted,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (result == null) {
        throw createHttpError.InternalServerError('Add account failed');
      }

      return res.json({
        success: true,
        result: result
      });
    } catch (error) {
      return next(error);
    }
  }

  async updateAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const formData: User = req.body;

      if (!formData) {
        throw createHttpError.InternalServerError(
          'Please provide full account information'
        );
      }

      const accountId: string = req.params.id;

      const account = await Account.findOne({
        $and: [{ id: { $ne: accountId } }, { email: req.body.email }]
      });

      if (account != null) {
        return res.json({
          success: false,
          message: `Account already exists`
        });
      }

      const account1 = await Account.findOne({
        $and: [{ id: { $ne: accountId } }, { username: req.body.username }]
      });

      if (account1 != null) {
        return res.json({
          success: false,
          message: `Username already exists`
        });
      }

      const result = await Account.updateOne(
        {
          id: accountId
        },
        {
          $set: {
            username: formData.username,
            full_name: formData.full_name,
            email: formData.email,
            status: formData.status,
            auth_type: formData.auth_type,
            role: formData.role,
            updated_at: new Date().toISOString()
          }
        }
      );

      if (result.modifiedCount != 1) {
        return next(
          createHttpError.InternalServerError('Update account failed')
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

  async deleteAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const accountId: string = req.params.id;

      const result = await Account.updateOne(
        {
          id: accountId
        },
        {
          $set: {
            status: 'deleted',
            updated_at: new Date().toISOString()
          }
        }
      );

      if (result.modifiedCount != 1) {
        return next(
          createHttpError.InternalServerError('Delete account failed')
        );
      }

      return res.json({
        success: true,
        message: 'Delete account suucessfully'
      });
    } catch (error) {
      return next(error);
    }
  }

  async deletePermanent(req: Request, res: Response, next: NextFunction) {
    try {
      const accountId: string = req.params.id;

      const result = await Account.deleteOne({
        id: accountId
      });

      if (result.deletedCount != 1) {
        return next(
          createHttpError.InternalServerError('Delete account failed')
        );
      }

      return res.json({
        success: true,
        message: 'Delete account suucessfully'
      });
    } catch (error) {
      return next(error);
    }
  }

  async deleteAccountMultiple(req: Request, res: Response, next: NextFunction) {
    try {
      const listAccountId: string[] | number[] = req.body.listAccountId;
      var results: UpdateWriteOpResult[] = [];
      for (var accountId of listAccountId) {
        const result = await Account.updateOne(
          {
            id: accountId
          },
          {
            $set: {
              status: 'deleted',
              updated_at: new Date().toISOString()
            }
          }
        );
        results.push(result);
      }

      if (results.some((r) => !r.acknowledged)) {
        return next(
          createHttpError.InternalServerError('Delete accounts failed')
        );
      }

      return res.json({
        success: true,
        message: 'Delete accounts suucessfully'
      });
    } catch (error) {
      return next(error);
    }
  }
}

export default new AccountController();
