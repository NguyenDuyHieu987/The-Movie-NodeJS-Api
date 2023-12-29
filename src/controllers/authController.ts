import * as argon2 from 'argon2';
import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';

import Account from '@/models/account';
import Subscription from '@/models/subscription';
import type { SigupForm, user } from '@/types';
import ValidateEmail from '@/utils/emailValidation';
import { encryptPassword, encryptPasswordOld } from '@/utils/encryptPassword';
import GenerateOTP from '@/utils/generateOTP';
import jwtRedis from '@/utils/jwtRedis';
import sendinblueEmail from '@/utils/sendinblueEmail';

class AuthController {
  constructor() {}

  private async getSubscription(userId: string, result: any) {
    const subscription = await Subscription.aggregate([
      {
        $match: { account_id: userId }
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

    const response: {
      isLogin?: boolean;
      isSignUp?: boolean;
      result: any;
      subscription?: any;
    } = result;

    if (subscription?.length == 1) {
      response.subscription = subscription[0];
    }

    return response;
  }

  async logIn(req: Request, res: Response, next: NextFunction) {
    try {
      const account = await Account.findOne({
        email: req.body.email,
        auth_type: 'email'
      });

      if (account == null) {
        return res.json({
          isNotExist: true,
          result: 'Account does not exists'
        });
      }

      // Migrate to Argon2
      if (account.password!.startsWith('$argon2id$')) {
        const isCorrectPassword = await argon2.verify(
          account.password!,
          req.body.password,
          {
            // secret: Buffer.from(process.env.APP_TOKEN_SECRET!),
          }
        );

        if (!isCorrectPassword) {
          return res.json({
            isWrongPassword: true,
            result: 'Wrong Password'
          });
        }

        const encoded = jwt.sign(
          {
            id: account.id,
            username: account.username,
            email: account.email,
            full_name: account.full_name,
            avatar: account.avatar,
            role: account.role,
            auth_type: account.auth_type,
            created_at: account.created_at,
            exp:
              Math.floor(Date.now() / 1000) +
              +process.env.JWT_EXP_OFFSET! * 3600
          },
          process.env.JWT_SIGNATURE_SECRET!,
          {
            algorithm: 'HS256'
            // expiresIn: process.env.JWT_EXP_OFFSET! + 'h',
          }
        );

        res.set('Access-Control-Expose-Headers', 'Authorization');

        res.cookie('user_token', encoded, {
          domain: req.hostname,
          httpOnly: req.session.cookie.httpOnly,
          sameSite: req.session.cookie.sameSite,
          secure: true,
          maxAge: +process.env.JWT_EXP_OFFSET! * 3600 * 1000
        });

        res.header('Authorization', encoded);

        const response = this.getSubscription(account.id, {
          isLogin: true,
          result: {
            id: account.id,
            username: account.username,
            full_name: account.full_name,
            avatar: account.avatar,
            email: account.email,
            auth_type: account.auth_type,
            role: account.role,
            created_at: account.created_at
          }
        });

        return res.json(response);
      } else {
        const passwordHashedOld = encryptPasswordOld(req.body.password);

        if (account.password != passwordHashedOld) {
          return res.json({
            isWrongPassword: true,
            result: 'Wrong Password'
          });
        }

        // Migrate to Argon2
        account.password = await encryptPassword(req.body.password);
        await account.save();

        const encoded = jwt.sign(
          {
            id: account.id,
            username: account.username,
            email: account.email,
            full_name: account.full_name,
            avatar: account.avatar,
            role: account.role,
            auth_type: account.auth_type,
            created_at: account.created_at,
            exp:
              Math.floor(Date.now() / 1000) +
              +process.env.JWT_EXP_OFFSET! * 3600
          },
          process.env.JWT_SIGNATURE_SECRET!,
          {
            algorithm: 'HS256'
            // expiresIn: process.env.JWT_EXP_OFFSET! + 'h',
          }
        );

        res.set('Access-Control-Expose-Headers', 'Authorization');

        res.cookie('user_token', encoded, {
          domain: req.hostname,
          httpOnly: req.session.cookie.httpOnly,
          sameSite: req.session.cookie.sameSite,
          secure: true,
          maxAge: +process.env.JWT_EXP_OFFSET! * 3600 * 1000
        });

        res.header('Authorization', encoded);

        const response = this.getSubscription(account.id, {
          isLogin: true,
          result: {
            id: account.id,
            username: account.username,
            full_name: account.full_name,
            avatar: account.avatar,
            email: account.email,
            auth_type: account.auth_type,
            role: account.role,
            created_at: account.created_at
          }
        });

        return res.json(response);
      }
    } catch (error) {
      next(error);
    }
  }

  async logInFacebook(req: Request, res: Response, next: NextFunction) {
    try {
      const accessToken: string = req.headers.authorization!.replace(
        'Bearer ',
        ''
      );

      const facebookUser: any = await fetch(
        `https://graph.facebook.com/v15.0/me?access_token=${accessToken}&fields=id,name,email,picture`
      )
        .then((response: any) => response.json())
        .catch((error) => {
          throw error;
        });

      const account = await Account.findOne({
        facebook_user_id: facebookUser!.id,
        auth_type: 'facebook'
      });

      if (account == null) {
        const accountId: string = uuidv4();

        const newAccount = await Account.create({
          id: accountId,
          facebook_user_id: facebookUser.id,
          username: facebookUser.name,
          full_name: facebookUser.name,
          avatar: facebookUser.picture.data.url,
          email: facebookUser.email,
          auth_type: 'facebook',
          role: 'normal',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        if (newAccount == null) {
          return res.json({
            isLogin: false,
            result: 'Login Facebook failed!'
          });
        }

        const encoded = jwt.sign(
          {
            id: newAccount.id,
            username: newAccount.username,
            email: newAccount.email,
            full_name: newAccount.full_name,
            avatar: newAccount.avatar,
            role: newAccount.role,
            auth_type: newAccount.auth_type,
            created_at: newAccount.created_at,
            exp:
              Math.floor(Date.now() / 1000) +
              +process.env.JWT_EXP_OFFSET! * 3600
          },
          process.env.JWT_SIGNATURE_SECRET!,
          {
            algorithm: 'HS256'
            // expiresIn: process.env.JWT_EXP_OFFSET! + 'h'
          }
        );

        res.set('Access-Control-Expose-Headers', 'Authorization');

        res.cookie('user_token', encoded, {
          domain: req.hostname,
          httpOnly: req.session.cookie.httpOnly,
          sameSite: req.session.cookie.sameSite,
          secure: true,
          maxAge: +process.env.JWT_EXP_OFFSET! * 3600 * 1000
        });

        res.header('Authorization', encoded);

        const response = this.getSubscription(newAccount.id, {
          isSignUp: true,
          result: {
            id: newAccount.id,
            username: newAccount.username,
            full_name: newAccount.full_name,
            avatar: newAccount.avatar,
            email: newAccount.email,
            auth_type: newAccount.auth_type,
            role: newAccount.role,
            created_at: newAccount.created_at
          }
        });

        return res.json(response);
      } else {
        const accountLogedIn = await Account.findOneAndUpdate(
          { id: account.id, auth_type: 'facebook' },
          {
            $set: {
              avatar: facebookUser.picture.data.url
            }
          },
          { returnDocument: 'after' }
        );

        if (accountLogedIn == null) {
          return res.json({
            isLogin: false,
            result: 'Login Facebook failed!'
          });
        }

        const encoded = jwt.sign(
          {
            id: accountLogedIn.id,
            username: accountLogedIn.username,
            email: accountLogedIn.email,
            full_name: accountLogedIn.full_name,
            avatar: accountLogedIn.avatar,
            role: accountLogedIn.role,
            auth_type: accountLogedIn.auth_type,
            created_at: accountLogedIn.created_at,
            exp:
              Math.floor(Date.now() / 1000) +
              +process.env.JWT_EXP_OFFSET! * 3600
          },
          process.env.JWT_SIGNATURE_SECRET!,
          {
            algorithm: 'HS256'
            //  expiresIn: process.env.JWT_EXP_OFFSET! + 'h'
          }
        );

        res.set('Access-Control-Expose-Headers', 'Authorization');

        res.cookie('user_token', encoded, {
          domain: req.hostname,
          httpOnly: req.session.cookie.httpOnly,
          sameSite: req.session.cookie.sameSite,
          secure: true,
          maxAge: +process.env.JWT_EXP_OFFSET! * 3600 * 1000
        });

        res.header('Authorization', encoded);

        const response = this.getSubscription(accountLogedIn.id, {
          isLogin: true,
          result: {
            id: accountLogedIn.id,
            username: accountLogedIn.username,
            full_name: accountLogedIn.full_name,
            avatar: accountLogedIn.avatar,
            email: accountLogedIn.email,
            auth_type: accountLogedIn.auth_type,
            role: accountLogedIn.role,
            created_at: accountLogedIn.created_at
          }
        });

        return res.json(response);
      }
    } catch (error) {
      next(error);
    }
  }

  async logInGoogle(req: Request, res: Response, next: NextFunction) {
    try {
      const accessToken: string = req.headers.authorization!.replace(
        'Bearer ',
        ''
      );

      const googleUser: any = await fetch(
        `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`,
        {
          headers: { Authorization: accessToken }
        }
      )
        .then((response: any) => response.json())
        .catch((error) => {
          throw error;
        });

      const account = await Account.findOne({
        google_user_id: googleUser.sub,
        auth_type: 'google'
      });

      if (account == null) {
        const accountId: string = uuidv4();

        const newAccount = await Account.create({
          id: accountId,
          google_user_id: googleUser.sub,
          username: googleUser.name,
          full_name: googleUser.name,
          avatar: googleUser.picture,
          email: googleUser.email,
          auth_type: 'google',
          role: 'normal',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        if (newAccount == null) {
          return res.json({
            isLogin: false,
            result: 'Login Google failed!'
          });
        }

        const encoded = jwt.sign(
          {
            id: newAccount.id,
            username: newAccount.username,
            email: newAccount.email,
            full_name: newAccount.full_name,
            avatar: newAccount.avatar,
            role: newAccount.role,
            auth_type: newAccount.auth_type,
            created_at: newAccount.created_at,
            exp:
              Math.floor(Date.now() / 1000) +
              +process.env.JWT_EXP_OFFSET! * 3600
          },
          process.env.JWT_SIGNATURE_SECRET!,
          {
            algorithm: 'HS256'
            //  expiresIn: process.env.JWT_EXP_OFFSET! + 'h'
          }
        );

        res.set('Access-Control-Expose-Headers', 'Authorization');

        res.cookie('user_token', encoded, {
          domain: req.hostname,
          httpOnly: req.session.cookie.httpOnly,
          sameSite: req.session.cookie.sameSite,
          secure: true,
          maxAge: +process.env.JWT_EXP_OFFSET! * 3600 * 1000
        });

        res.header('Authorization', encoded);

        const response = this.getSubscription(newAccount.id, {
          isSignUp: true,
          result: {
            id: newAccount.id,
            username: newAccount.username,
            full_name: newAccount.full_name,
            avatar: newAccount.avatar,
            email: newAccount.email,
            auth_type: newAccount.auth_type,
            role: newAccount.role,
            created_at: newAccount.created_at
          }
        });

        return res.json(response);
      } else {
        const encoded = jwt.sign(
          {
            id: account.id,
            username: account.username,
            email: account.email,
            full_name: account.full_name,
            avatar: account.avatar,
            role: account.role,
            auth_type: account.auth_type,
            created_at: account.created_at,
            exp:
              Math.floor(Date.now() / 1000) +
              +process.env.JWT_EXP_OFFSET! * 3600
          },
          process.env.JWT_SIGNATURE_SECRET!,
          {
            algorithm: 'HS256'
            //  expiresIn: process.env.JWT_EXP_OFFSET! + 'h'
          }
        );

        res.set('Access-Control-Expose-Headers', 'Authorization');

        res.cookie('user_token', encoded, {
          domain: req.hostname,
          httpOnly: req.session.cookie.httpOnly,
          sameSite: req.session.cookie.sameSite,
          secure: true,
          maxAge: +process.env.JWT_EXP_OFFSET! * 3600 * 1000
        });

        res.header('Authorization', encoded);

        const response = this.getSubscription(account.id, {
          isLogin: true,
          result: {
            id: account.id,
            username: account.username,
            full_name: account.full_name,
            avatar: account.avatar,
            email: account.email,
            auth_type: account.auth_type,
            role: account.role,
            created_at: account.created_at
          }
        });

        return res.json(response);
      }
    } catch (error) {
      next(error);
    }
  }

  async getUserByToken(req: Request, res: Response, next: NextFunction) {
    try {
      const user_token =
        req.cookies.user_token ||
        req.headers.authorization!.replace('Bearer ', '');

      // console.log(req.cookies.user_token);

      const user = jwt.verify(user_token, process.env.JWT_SIGNATURE_SECRET!, {
        algorithms: ['HS256']
      }) as user;

      // console.log(req.headers['user-agent']);

      const isAlive = await jwtRedis
        .setPrefix('user_logout')
        .verify(user_token);

      if (!isAlive) {
        return res.json({
          isLogin: false,
          result: 'Token is no longer active'
        });
      }

      res.set('Access-Control-Expose-Headers', 'Authorization');

      res.header('Authorization', user_token);

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

      const response: {
        isLogin: boolean;
        result: any;
        subscription?: any;
      } = {
        isLogin: true,
        result: {
          id: user.id,
          username: user.username,
          full_name: user.full_name,
          avatar: user.avatar,
          email: user.email,
          auth_type: user.auth_type,
          role: user.role,
          created_at: user.created_at
        }
      };

      if (subscription?.length == 1) {
        response.subscription = subscription[0];
      }

      return res.json(response);
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

  async signUp(req: Request, res: Response, next: NextFunction) {
    try {
      // const signup_token = req.headers.authorization!.replace('Bearer ', '');
      const signup_token = req.cookies?.vrf_signup_token || req.body.token;

      const user = jwt.verify(signup_token, req.body.otp, {
        algorithms: ['HS256']
      }) as SigupForm;

      const isAlive = await jwtRedis
        .setPrefix('vrf_signup_token')
        .verify(signup_token);

      if (!isAlive) {
        return res.json({
          success: false,
          result: 'Token is no longer active'
        });
      }

      const account = await Account.findOne({
        id: user.id,
        auth_type: 'email'
      });

      if (account != null) {
        return res.json({
          isAccountExist: true,
          result: 'Account is already exists'
        });
      }

      const accountId: string = uuidv4();

      const newAccout = await Account.create({
        id: accountId,
        username: user.username,
        password: user.password,
        full_name: user.full_name,
        avatar: user.avatar,
        email: user.email,
        auth_type: user.auth_type,
        role: user.role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      jwtRedis.setPrefix('vrf_signup_token');

      await jwtRedis.sign(signup_token, {
        exp: +process.env.OTP_EXP_OFFSET! * 60
      });

      res.clearCookie('vrf_signup_token', {
        domain: req.hostname,
        httpOnly: req.session.cookie.httpOnly,
        sameSite: req.session.cookie.sameSite,
        secure: true
      });

      return res.json({
        isSignUp: true,
        result: 'Sign up account successfully'
      });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.json({ isOTPExpired: true, result: 'OTP is expired' });
      }

      if (error instanceof jwt.JsonWebTokenError) {
        return res.json({ isInvalidOTP: true, result: 'OTP is invalid' });
      }

      next(error);
    }
  }

  async signUpVerify(req: Request, res: Response, next: NextFunction) {
    try {
      const formUser: SigupForm = req.body;

      switch (req.params.type) {
        case 'email':
          const account = await Account.findOne({
            email: formUser.email,
            auth_type: 'email'
          });

          if (account != null) {
            return res.json({
              isEmailExist: true,
              result: 'Email is already exists'
            });
          }

          if (!(await ValidateEmail(formUser.email))) {
            // if (true) {
            return res.json({
              isInValidEmail: true,
              result: 'Email is Invalid'
            });
          }

          const OTP = GenerateOTP({ length: 6 });

          console.log(OTP);

          const passwordEncrypted = await encryptPassword(formUser.password);

          const encoded = jwt.sign(
            {
              username: formUser.username,
              password: passwordEncrypted,
              email: formUser.email,
              full_name: formUser.full_name,
              avatar: formUser.avatar,
              role: 'normal',
              auth_type: 'email',
              description: 'Register new account',
              exp:
                Math.floor(Date.now() / 1000) +
                +process.env.OTP_EXP_OFFSET! * 60
            },
            OTP,
            {
              algorithm: 'HS256'
              // expiresIn: +process.env.OTP_EXP_OFFSET! * 60,
            }
          );

          const emailResponse = await sendinblueEmail.VerificationOTP({
            to: formUser.email,
            otp: OTP,
            title: 'Xác nhận đăng ký tài khoản',
            noteExp: +process.env.OTP_EXP_OFFSET!
          });

          // res.set('Access-Control-Expose-Headers', 'Authorization');
          // res.header('Authorization', encoded);

          res.cookie('vrf_signup_token', encoded, {
            domain: req.hostname,
            httpOnly: req.session.cookie.httpOnly,
            sameSite: req.session.cookie.sameSite,
            secure: true,
            maxAge: +process.env.OTP_EXP_OFFSET! * 60 * 1000
          });

          return res.json({
            isSended: true,
            exp_offset: +process.env.OTP_EXP_OFFSET! * 60,
            result: 'Send otp email successfully'
          });

          break;
        default:
          return next(
            createHttpError.NotFound(
              `Verify sign up with method: ${req.params.type} is not support!`
            )
          );
          break;
      }
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      switch (req.params.type) {
        case 'email':
          const account = await Account.findOne({
            email: req.body.email,
            auth_type: 'email'
          });

          if (account == null) {
            return res.json({
              isEmailExist: false,
              result: 'Email is not registered'
            });
          }

          if (!(await ValidateEmail(req.body.email))) {
            // if (true) {
            return res.json({
              isInValidEmail: true,
              result: 'Email is Invalid'
            });
          }

          const encoded = jwt.sign(
            {
              id: account.id,
              email: account.email,
              auth_type: 'email',
              description: 'Reset your password',
              exp:
                Math.floor(Date.now() / 1000) +
                +process.env.FORGOT_PASSWORD_EXP_OFFSET! * 60
            },
            process.env.JWT_SIGNATURE_SECRET!,
            {
              algorithm: 'HS256'
              // expiresIn: +process.env.FORGOT_PASSWORD_EXP_OFFSET! * 60,
            }
          );

          const clientUrl =
            process.env.NODE_ENV == 'production'
              ? process.env.CLIENT_URL!
              : req.headers.origin;

          const resetPasswordLink = `${clientUrl}/ResetPassword?token=${encoded}`;

          console.log(resetPasswordLink);

          const emailResponse = await sendinblueEmail.VerificationLink({
            to: req.body.email,
            title: 'Đặt lại mật khẩu của bạn',
            subject: 'Hoàn thành yêu cầu đặt lại mật khẩu',
            nameLink: 'Đặt lại mật khẩu',
            linkVerify: resetPasswordLink,
            note1:
              'Truy cập dường liên kết sau đây để đặt lại mật khẩu của bạn:',
            noteExp: +process.env.FORGOT_PASSWORD_EXP_OFFSET!
          });

          res.cookie('rst_pwd_token', encoded, {
            domain: req.hostname,
            httpOnly: req.session.cookie.httpOnly,
            sameSite: req.session.cookie.sameSite,
            secure: true,
            maxAge: +process.env.FORGOT_PASSWORD_EXP_OFFSET! * 60 * 1000
          });

          return res.json({
            isSended: true,
            exp_offset: +process.env.FORGOT_PASSWORD_EXP_OFFSET! * 60,
            result: 'Send email successfully'
          });

          break;
        default:
          return next(
            createHttpError.NotFound(
              `Forgot password with method: ${req.params.type} is not support!`
            )
          );
          break;
      }
    } catch (error) {
      next(error);
    }
  }

  async logOut(req: Request, res: Response, next: NextFunction) {
    try {
      const user_token =
        req.cookies.user_token ||
        req.headers.authorization!.replace('Bearer ', '');

      const user = jwt.verify(user_token, process.env.JWT_SIGNATURE_SECRET!, {
        algorithms: ['HS256']
      });

      jwtRedis.setPrefix('user_logout');

      await jwtRedis.sign(user_token, {
        exp: +process.env.JWT_EXP_OFFSET! * 60 * 60
      });

      res.clearCookie('user_token', {
        domain: req.hostname,
        httpOnly: req.session.cookie.httpOnly,
        sameSite: req.session.cookie.sameSite,
        secure: true
      });

      return res.json({ isLogout: true, result: 'Log out successfully' });
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

        return res.json({ isLogout: false, result: 'Log out failed' });
      }

      next(error);
    }
  }
}

export default new AuthController();
