import * as argon2 from 'argon2';
import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import type { JwtPayload } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';

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

export class AccountController extends RedisCache {
  constructor() {
    super();
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
          const vrfEmailToken = req.cookies?.vrf_email_token;

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
              prefix: 'vrf_email_token',
              oldToken: vrfEmailToken
            }
          );

          emailResponse = await sendinblueEmail.VerificationOTP({
            to: user.email,
            otp: OTP,
            title: 'Xác nhận Email của bạn',
            noteExp: +process.env.OTP_EXP_OFFSET!
          });

          res.cookie('vrf_email_token', encoded, {
            domain: req.hostname,
            httpOnly: req.session.cookie.httpOnly,
            sameSite: req.session.cookie.sameSite,
            secure: true,
            maxAge: +process.env.OTP_EXP_OFFSET! * ONE_MINUTE * 1000
          });
          break;
        case 'change-password':
          const account = await Account.findOne({
            email: user.email,
            auth_type: 'email'
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

          const oldChgPwdToken = req.cookies?.chg_pwd_token;

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
              prefix: 'chg_pwd_token',
              oldToken: oldChgPwdToken
            }
          );

          emailResponse = await sendinblueEmail.VerificationOTP({
            to: user.email,
            otp: OTP,
            title: 'Xác nhận thay đổi mật khẩu của bạn',
            noteExp: +process.env.OTP_EXP_OFFSET!
          });

          res.cookie('chg_pwd_token', encoded, {
            domain: req.hostname,
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

          const oldChgEmailToken = req.cookies?.chg_email_token;

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
            { prefix: 'chg_email_token', oldToken: oldChgEmailToken }
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
            subject: 'Hoàn thành yêu cầu đặt thay đổi email',
            nameLink: 'Thay đổi email',
            linkVerify: changeEmailLink,
            note1: 'Truy cập dường liên kết sau đây để thay đổi email của bạn:',
            noteExp: +process.env.CHANGE_EMAIL_EXP_OFFSET!
          });

          res.cookie('chg_email_token', encoded, {
            domain: req.hostname,
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

      if (!encoded) {
        return next(
          createHttpError.InternalServerError(`Verify account failed`)
        );
      } else {
        return res.json({
          isSended: true,
          exp_offset: +process.env.OTP_EXP_OFFSET! * ONE_MINUTE,
          result: 'Send otp email successfully'
        });
      }
    } catch (error) {
      return next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userToken = res.locals.userToken;
      const user = res.locals.user as User;

      const verifyToken = req.cookies?.chg_pwd_token || req.body.token;

      if (!verifyToken) {
        return next(createHttpError.BadRequest('Token is required'));
      }

      const decodeChangePassword = (await verifyDefaultToken(verifyToken, {
        signature: req.body.otp,
        prefix: 'chg_pwd_token'
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

      jwtRedis.setRevokePrefix('chg_pwd_token');

      await jwtRedis.sign(verifyToken, {
        EX: +process.env.OTP_EXP_OFFSET! * ONE_MINUTE
      });

      res.clearCookie('chg_pwd_token', {
        domain: req.hostname,
        httpOnly: req.session.cookie.httpOnly,
        sameSite: req.session.cookie.sameSite,
        secure: true
      });

      if (decodeChangePassword.logout_all_device) {
        await RedisCache.client.del(`user_login__${user.id}`);

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

        const newUserToken = await signUserToken(accountInfo, userToken);

        const newRefreshToken = await signRefreshToken(accountInfo);

        res.set('Access-Control-Expose-Headers', 'Authorization');

        res.cookie('user_token', newUserToken, {
          domain: req.hostname,
          httpOnly: req.session.cookie.httpOnly,
          sameSite: req.session.cookie.sameSite,
          secure: true,
          maxAge: +process.env.JWT_ACCESS_EXP_OFFSET! * ONE_HOUR * 1000
        });

        res.cookie('refresh_token', newRefreshToken, {
          domain: req.hostname,
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

      const newUserToken = await signUserToken(
        {
          id: account.id,
          username: account.username,
          email: account.email,
          full_name: account.full_name,
          avatar: account.avatar,
          role: account.role,
          auth_type: account.auth_type,
          created_at: account.created_at
        },
        userToken
      );

      res.set('Access-Control-Expose-Headers', 'Authorization');

      res.cookie('user_token', newUserToken, {
        domain: req.hostname,
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

      const verifyToken = req.cookies?.vrf_email_token || req.body.token;

      if (!verifyToken) {
        return next(createHttpError.BadRequest('Token is required'));
      }

      const decoded = await verifyDefaultToken(verifyToken, {
        signature: req.body.otp,
        prefix: 'vrf_email_token'
      });

      res.clearCookie('vrf_email_token', {
        domain: req.hostname,
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
      const token: string = req.cookies.chg_email_token || req.params.token;

      if (!token) {
        return next(createHttpError.BadRequest('Token is required'));
      }

      const changeEmailInfo = (await verifyDefaultToken(token, {
        prefix: 'chg_email_token'
      })) as JwtPayload;

      const account = await Account.findOne({
        id: changeEmailInfo.id,
        email: changeEmailInfo.email,
        auth_type: changeEmailInfo.auth_type
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
      const token: string = req.cookies.chg_email_token || req.body.token;

      if (!token) {
        return next(createHttpError.BadRequest('Token is required'));
      }

      const changeEmailInfo = (await verifyDefaultToken(token, {
        prefix: 'chg_email_token'
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

      jwtRedis.setRevokePrefix('chg_email_token');

      await jwtRedis.sign(token, {
        EX: +process.env.CHANGE_EMAIL_EXP_OFFSET! * ONE_MINUTE
      });

      const newUserToken = await signUserToken(
        {
          id: account.id,
          username: account.username,
          email: account.email,
          full_name: account.full_name,
          avatar: account.avatar,
          role: account.role,
          auth_type: account.auth_type,
          created_at: account.created_at
        },
        userToken
      );

      res.set('Access-Control-Expose-Headers', 'Authorization');

      res.cookie('user_token', newUserToken, {
        domain: req.hostname,
        httpOnly: req.session.cookie.httpOnly,
        sameSite: req.session.cookie.sameSite,
        secure: true,
        maxAge: +process.env.JWT_ACCESS_EXP_OFFSET! * ONE_HOUR * 1000
      });

      res.clearCookie('chg_email_token', {
        domain: req.hostname,
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
      const token: string = req.cookies.rst_pwd_token || req.params.token;

      if (!token) {
        return next(createHttpError.BadRequest('Token is required'));
      }

      const resetPasswordInfo = (await verifyDefaultToken(token, {
        prefix: 'rst_pwd_token'
      })) as JwtPayload;

      const account = await Account.findOne({
        id: resetPasswordInfo.id,
        email: resetPasswordInfo.email,
        auth_type: resetPasswordInfo.auth_type
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
      const token: string = req.cookies.rst_pwd_token || req.body.token;

      if (!token) {
        return next(createHttpError.BadRequest('Token is required'));
      }

      const resetPasswordInfo = (await verifyDefaultToken(token, {
        prefix: 'rst_pwd_token'
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

      jwtRedis.setRevokePrefix('rst_pwd_token');

      await jwtRedis.sign(token, {
        EX: +process.env.FORGOT_PASSWORD_EXP_OFFSET! * ONE_MINUTE
      });

      res.clearCookie('rst_pwd_token', {
        domain: req.hostname,
        httpOnly: req.session.cookie.httpOnly,
        sameSite: req.session.cookie.sameSite,
        secure: true
      });

      const isLogOutAllDevice = req.body.logout_all_device == 'true';

      if (isLogOutAllDevice) {
        await RedisCache.client.del(`user_login__${resetPasswordInfo.id}`);
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
}

export default new AccountController();
