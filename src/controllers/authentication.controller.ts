import * as argon2 from 'argon2';
import type { NextFunction, Request, Response } from 'express';
import { google } from 'googleapis';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';

import { oauth2Client } from '@/config/google';
import RedisCache from '@/config/redis';
import { APP_TOKEN_SECRET } from '@/constants';
import Account from '@/models/account';
import Subscription from '@/models/subscription';
import type { SignupForm, User } from '@/types';
import ValidateEmail from '@/utils/emailValidation';
import { encryptPassword, encryptPasswordOld } from '@/utils/encryptPassword';
import GenerateOTP from '@/utils/generateOTP';
import {
  JWT_ALGORITHM,
  JWT_ALLOWED_ALGORITHMS,
  signDefaultToken,
  signRefreshToken,
  signUserToken
} from '@/utils/jwt';
import jwtRedis from '@/utils/jwtRedis';
import sendinblueEmail from '@/utils/sendinblueEmail';

type ResponseLogin = {
  isLogin?: boolean;
  isSignUp?: boolean;
  result: any;
  subscription?: any;
};

class AuthController extends RedisCache {
  constructor() {
    super();
  }

  private static async getSubscription(
    userId: string,
    result: any
  ): Promise<ResponseLogin> {
    const subscription = await Subscription.aggregate([
      {
        $match: { account_id: userId }
      },
      {
        $lookup: {
          from: 'plans',
          localField: 'plan_id',
          foreignField: 'id',
          as: 'plan'
        }
      },
      {
        $unwind: '$plan'
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
            // secret: Buffer.from(APP_TOKEN_SECRET),
          }
        );

        if (!isCorrectPassword) {
          return res.json({
            isWrongPassword: true,
            result: 'Wrong Password'
          });
        }
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
      }

      const encoded = signUserToken({
        id: account.id,
        username: account.username,
        email: account.email,
        full_name: account.full_name,
        avatar: account.avatar,
        role: account.role,
        auth_type: account.auth_type,
        created_at: account.created_at
      });

      const refreshToen = signRefreshToken({
        id: account.id,
        username: account.username,
        email: account.email,
        full_name: account.full_name,
        avatar: account.avatar,
        role: account.role,
        auth_type: account.auth_type,
        created_at: account.created_at
      });

      // await RedisCache.client.set('user_token', JSON.stringify([refreshToen]), {
      //   EX: +process.env.JWT_REFRESH_EXP_OFFSET! * 60 * 60
      // });

      res.set('Access-Control-Expose-Headers', 'Authorization');

      res.cookie('user_token', encoded, {
        domain: req.hostname,
        httpOnly: req.session.cookie.httpOnly,
        sameSite: req.session.cookie.sameSite,
        secure: true,
        maxAge: +process.env.JWT_ACCESS_EXP_OFFSET! * 3600 * 1000
      });

      res.header('Authorization', encoded);

      const response = await AuthController.getSubscription(account.id, {
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
    } catch (error) {
      return next(error);
    }
  }

  async logInFacebook(req: Request, res: Response, next: NextFunction) {
    try {
      const accessToken: string = req.headers.authorization!.replace(
        'Bearer ',
        ''
      );

      const facebookUser = await fetch(
        `${process.env.FACEBOOK_API_URL}/me?access_token=${accessToken}&fields=id,name,email,picture`
      )
        .then((response) => response.json())
        .catch((error) => {
          throw error;
        });

      if (!facebookUser) {
        createHttpError.InternalServerError("Cant't find the Facebook user");
      }

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

        const encoded = signUserToken({
          id: newAccount.id,
          username: newAccount.username,
          email: newAccount.email,
          full_name: newAccount.full_name,
          avatar: newAccount.avatar,
          role: newAccount.role,
          auth_type: newAccount.auth_type,
          created_at: newAccount.created_at
        });

        res.set('Access-Control-Expose-Headers', 'Authorization');

        res.cookie('user_token', encoded, {
          domain: req.hostname,
          httpOnly: req.session.cookie.httpOnly,
          sameSite: req.session.cookie.sameSite,
          secure: true,
          maxAge: +process.env.JWT_ACCESS_EXP_OFFSET! * 3600 * 1000
        });

        res.header('Authorization', encoded);

        const response = await AuthController.getSubscription(newAccount.id, {
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

        const encoded = signUserToken({
          id: accountLogedIn.id,
          username: accountLogedIn.username,
          email: accountLogedIn.email,
          full_name: accountLogedIn.full_name,
          avatar: accountLogedIn.avatar,
          role: accountLogedIn.role,
          auth_type: accountLogedIn.auth_type,
          created_at: accountLogedIn.created_at
        });

        res.set('Access-Control-Expose-Headers', 'Authorization');

        res.cookie('user_token', encoded, {
          domain: req.hostname,
          httpOnly: req.session.cookie.httpOnly,
          sameSite: req.session.cookie.sameSite,
          secure: true,
          maxAge: +process.env.JWT_ACCESS_EXP_OFFSET! * 3600 * 1000
        });

        res.header('Authorization', encoded);

        const response = await AuthController.getSubscription(
          accountLogedIn.id,
          {
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
          }
        );

        return res.json(response);
      }
    } catch (error) {
      return next(error);
    }
  }

  private static async getGoogleUserByAccessToken(accessToken: string) {
    oauth2Client.setCredentials({
      access_token: accessToken
    });

    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2'
    });

    const googleUser = await oauth2.userinfo.get();

    return googleUser.data;

    // const googleUser = await fetch(
    //   `${process.env.GOOGLE_API_URL}/oauth2/v3/userinfo?access_token=${accessToken}`,
    //   {
    //     headers: { Authorization: accessToken }
    //   }
    // )
    //   .then((response) => response.json())
    //   .catch((error) => {
    //     throw error;
    //   });

    // return { id: googleUser?.sub, ...googleUser };
  }

  async logInGoogle(req: Request, res: Response, next: NextFunction) {
    try {
      let googleUser = null;

      if (req.headers.authorization) {
        const accessToken: string = req.headers.authorization!.replace(
          'Bearer ',
          ''
        );

        googleUser =
          await AuthController.getGoogleUserByAccessToken(accessToken);
      }

      const authorizationCode = req.body?.authorization_code;
      const redirectUri = req.body?.redirect_uri;

      if (authorizationCode) {
        let oauth2ClientWithRedUri = oauth2Client;

        if (redirectUri) {
          oauth2ClientWithRedUri = new google.auth.OAuth2(
            process.env.GOOGLE_OAUTH2_CLIENT_ID,
            process.env.GOOGLE_OAUTH2_CLIENT_SECRET,
            redirectUri
          );
        }

        const { tokens } =
          await oauth2ClientWithRedUri.getToken(authorizationCode);
        const accessToken = tokens.access_token!;

        googleUser =
          await AuthController.getGoogleUserByAccessToken(accessToken);
      }

      if (googleUser == null) {
        createHttpError.InternalServerError("Cant't find the Google user");
      }

      const googleUserId = googleUser?.id;

      const account = await Account.findOne({
        google_user_id: googleUserId,
        auth_type: 'google'
      });

      if (account == null) {
        const accountId: string = uuidv4();

        const newAccount = await Account.create({
          id: accountId,
          google_user_id: googleUserId,
          username: googleUser?.name,
          full_name: googleUser?.name,
          avatar: googleUser?.picture,
          email: googleUser?.email,
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

        const encoded = signUserToken({
          id: newAccount.id,
          username: newAccount.username,
          email: newAccount.email,
          full_name: newAccount.full_name,
          avatar: newAccount.avatar,
          role: newAccount.role,
          auth_type: newAccount.auth_type,
          created_at: newAccount.created_at
        });

        res.set('Access-Control-Expose-Headers', 'Authorization');

        res.cookie('user_token', encoded, {
          domain: req.hostname,
          httpOnly: req.session.cookie.httpOnly,
          sameSite: req.session.cookie.sameSite,
          secure: true,
          maxAge: +process.env.JWT_ACCESS_EXP_OFFSET! * 3600 * 1000
        });

        res.header('Authorization', encoded);

        const response = await AuthController.getSubscription(newAccount.id, {
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
        const encoded = signUserToken({
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

        res.cookie('user_token', encoded, {
          domain: req.hostname,
          httpOnly: req.session.cookie.httpOnly,
          sameSite: req.session.cookie.sameSite,
          secure: true,
          maxAge: +process.env.JWT_ACCESS_EXP_OFFSET! * 3600 * 1000
        });

        res.header('Authorization', encoded);

        const response = await AuthController.getSubscription(account.id, {
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
      return next(error);
    }
  }

  async logInGoogle_Archive(req: Request, res: Response, next: NextFunction) {
    try {
      const accessToken: string = req.headers.authorization!.replace(
        'Bearer ',
        ''
      );

      const googleUser =
        await AuthController.getGoogleUserByAccessToken(accessToken);

      if (!googleUser) {
        createHttpError.InternalServerError("Cant't find the Google user");
      }

      const googleUserId = googleUser?.id;

      const account = await Account.findOne({
        google_user_id: googleUserId,
        auth_type: 'google'
      });

      if (account == null) {
        const accountId: string = uuidv4();

        const newAccount = await Account.create({
          id: accountId,
          google_user_id: googleUserId,
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

        const encoded = signUserToken({
          id: newAccount.id,
          username: newAccount.username,
          email: newAccount.email,
          full_name: newAccount.full_name,
          avatar: newAccount.avatar,
          role: newAccount.role,
          auth_type: newAccount.auth_type,
          created_at: newAccount.created_at
        });

        res.set('Access-Control-Expose-Headers', 'Authorization');

        res.cookie('user_token', encoded, {
          domain: req.hostname,
          httpOnly: req.session.cookie.httpOnly,
          sameSite: req.session.cookie.sameSite,
          secure: true,
          maxAge: +process.env.JWT_ACCESS_EXP_OFFSET! * 3600 * 1000
        });

        res.header('Authorization', encoded);

        const response = await AuthController.getSubscription(newAccount.id, {
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
        const encoded = signUserToken({
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

        res.cookie('user_token', encoded, {
          domain: req.hostname,
          httpOnly: req.session.cookie.httpOnly,
          sameSite: req.session.cookie.sameSite,
          secure: true,
          maxAge: +process.env.JWT_ACCESS_EXP_OFFSET! * 3600 * 1000
        });

        res.header('Authorization', encoded);

        const response = await AuthController.getSubscription(account.id, {
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
      return next(error);
    }
  }

  async getUserByToken(req: Request, res: Response, next: NextFunction) {
    try {
      const userToken = res.locals.userToken;
      const user = res.locals.user as User;

      res.set('Access-Control-Expose-Headers', 'Authorization');

      res.header('Authorization', userToken);

      const response = await AuthController.getSubscription(user.id, {
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
      });

      return res.json(response);
    } catch (error) {
      return next(error);
    }
  }

  async signUp(req: Request, res: Response, next: NextFunction) {
    try {
      // const signupToken = req.headers.authorization!.replace('Bearer ', '');
      const signupToken = req.cookies?.vrf_signup_token || req.body.token;

      const signupUser = jwt.verify(signupToken, req.body.otp, {
        algorithms: JWT_ALLOWED_ALGORITHMS
      }) as SignupForm;

      const isAlive = await jwtRedis
        .setPrefix('vrf_signup_token')
        .verify(signupToken);

      if (!isAlive) {
        return res.json({
          success: false,
          result: 'Token is no longer active'
        });
      }

      const account = await Account.findOne({
        id: signupUser.id,
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
        username: signupUser.username,
        password: signupUser.password,
        full_name: signupUser.full_name,
        avatar: signupUser.avatar,
        email: signupUser.email,
        auth_type: signupUser.auth_type,
        role: signupUser.role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      jwtRedis.setRevokePrefix('vrf_signup_token');

      await jwtRedis.sign(signupToken, {
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

      return next(error);
    }
  }

  async signUpVerify(req: Request, res: Response, next: NextFunction) {
    try {
      const formUser: SignupForm = req.body;

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

          const avatar: string = (
            Math.floor(Math.random() * 10) + 1
          ).toString();

          const encoded = jwt.sign(
            {
              username: formUser.username,
              password: passwordEncrypted,
              email: formUser.email,
              full_name: formUser.full_name,
              avatar,
              role: 'normal',
              auth_type: 'email',
              description: 'Register new account',
              exp:
                Math.floor(Date.now() / 1000) +
                +process.env.OTP_EXP_OFFSET! * 60
            },
            OTP,
            {
              algorithm: JWT_ALGORITHM
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

        default:
          return next(
            createHttpError.NotFound(
              `Verify sign up with method: ${req.params.type} is not support!`
            )
          );
      }
    } catch (error) {
      return next(error);
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

          const encoded = signDefaultToken({
            id: account.id,
            email: account.email,
            auth_type: 'email',
            description: 'Reset your password',
            exp:
              Math.floor(Date.now() / 1000) +
              +process.env.FORGOT_PASSWORD_EXP_OFFSET! * 60
          });

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

        default:
          return next(
            createHttpError.NotFound(
              `Forgot password with method: ${req.params.type} is not support!`
            )
          );
      }
    } catch (error) {
      return next(error);
    }
  }

  async logOut(req: Request, res: Response, next: NextFunction) {
    try {
      const userToken = res.locals.userToken;
      const user = res.locals.user as User;

      jwtRedis.setRevokePrefix('user_token');

      await jwtRedis.sign(userToken, {
        exp: +process.env.JWT_ACCESS_EXP_OFFSET! * 60 * 60
      });

      if (user.auth_type == 'google') {
        // oauth2Client.revokeCredentials();
      }

      res.clearCookie('user_token', {
        domain: req.hostname,
        httpOnly: req.session.cookie.httpOnly,
        sameSite: req.session.cookie.sameSite,
        secure: true
      });

      return res.json({ isLogout: true, result: 'Log out successfully' });
    } catch (error) {
      return next(error);
    }
  }
}

export default new AuthController();
