import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import createHttpError from 'http-errors';
import Account from '@/models/account';
import type { SigupForm, user } from '@/types';
import SendinblueEmail from '@/utils/sendinblueEmail';
import GenerateOTP from '@/utils/generateOTP';
import jwtRedis from '@/utils/jwtRedis';
import ValidateEmail from '@/utils/emailValidation';

class AuthController {
  constructor() {
    jwtRedis.setPrefix('user_logout');
  }

  async logIn(req: Request, res: Response, next: NextFunction) {
    try {
      const account = await Account.findOne({
        email: req.body.email,
        auth_type: 'email',
      });

      if (account != null) {
        if (account.password == req.body.password) {
          const encoded = jwt.sign(
            {
              id: account.id,
              username: account.username,
              password: account.password,
              email: account.email,
              full_name: account.full_name,
              avatar: account.avatar,
              role: account.role,
              auth_type: account.auth_type,
              created_at: account.created_at,
              exp:
                Math.floor(Date.now() / 1000) +
                +process.env.JWT_EXP_OFFSET! * 3600,
            },
            process.env.JWT_SIGNATURE_SECRET!,
            {
              algorithm: 'HS256',
              // expiresIn: process.env.JWT_EXP_OFFSET! + 'h',
            }
          );

          res.set('Access-Control-Expose-Headers', 'Authorization');

          res.cookie('user_token', encoded, {
            domain:
              process.env.NODE_ENV! == 'production'
                ? 'phimhay247z.org'
                : 'localhost',
            httpOnly: req.session.cookie.httpOnly,
            sameSite: req.session.cookie.sameSite,
            secure: true,
            maxAge: +process.env.JWT_EXP_OFFSET! * 3600 * 1000,
          });

          res.header('Authorization', encoded);

          return res.json({
            isLogin: true,
            exp_token_hours: +process.env.JWT_EXP_OFFSET!,
            result: {
              id: account.id,
              username: account.username,
              full_name: account.full_name,
              avatar: account.avatar,
              email: account.email,
              auth_type: account.auth_type,
              role: account.role,
              created_at: account.created_at,
            },
          });
        } else {
          return res.json({ isWrongPassword: true, result: 'Wrong Password' });
        }
      } else {
        return res.json({
          isNotExist: true,
          result: 'Account does not exists',
        });
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

      const account = await Account.findOne({ id: facebookUser!.id });

      if (account == null) {
        // await Account.collection.insertOne({
        //   id: facebookUser.id,
        //   username: facebookUser.name,
        //   full_name: facebookUser.name,
        //   avatar: facebookUser.picture.data.url,
        //   email: facebookUser.email,
        //   auth_type: 'facebook',
        //   role: 'normal',
        //   created_at: new Date().toISOString(),
        //   updated_at: new Date().toISOString(),
        // });

        await Account.create({
          id: facebookUser.id,
          username: facebookUser.name,
          full_name: facebookUser.name,
          avatar: facebookUser.picture.data.url,
          email: facebookUser.email,
          auth_type: 'facebook',
          role: 'normal',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        const newAccount = await Account.findOne({
          id: facebookUser.id,
          auth_type: 'facebook',
        });

        if (newAccount != null) {
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
                +process.env.JWT_EXP_OFFSET! * 3600,
            },
            process.env.JWT_SIGNATURE_SECRET!,
            {
              algorithm: 'HS256',
              // expiresIn: process.env.JWT_EXP_OFFSET! + 'h'
            }
          );

          res.set('Access-Control-Expose-Headers', 'Authorization');

          res.cookie('user_token', encoded, {
            domain:
              process.env.NODE_ENV! == 'production'
                ? 'phimhay247z.org'
                : 'localhost',
            httpOnly: req.session.cookie.httpOnly,
            sameSite: req.session.cookie.sameSite,
            secure: true,
            maxAge: +process.env.JWT_EXP_OFFSET! * 3600 * 1000,
          });

          res.header('Authorization', encoded);

          return res.json({
            isSignUp: true,
            exp_token_hours: +process.env.JWT_EXP_OFFSET!,
            result: {
              id: newAccount.id,
              username: newAccount.username,
              full_name: newAccount.full_name,
              avatar: newAccount.avatar,
              email: newAccount.email,
              auth_type: newAccount.auth_type,
              role: newAccount.role,
              created_at: newAccount.created_at,
            },
          });
        } else {
          return res.json({
            isLogin: false,
            result: 'Login Facebook failed!',
          });
        }
      } else {
        const accountLogedIn = await Account.findOneAndUpdate(
          { id: facebookUser.id },
          {
            $set: {
              avatar: facebookUser.picture.data.url,
            },
          },
          { returnDocument: 'after' }
        );

        if (accountLogedIn != null) {
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
                +process.env.JWT_EXP_OFFSET! * 3600,
            },
            process.env.JWT_SIGNATURE_SECRET!,
            {
              algorithm: 'HS256',
              //  expiresIn: process.env.JWT_EXP_OFFSET! + 'h'
            }
          );

          res.set('Access-Control-Expose-Headers', 'Authorization');

          res.cookie('user_token', encoded, {
            domain:
              process.env.NODE_ENV! == 'production'
                ? 'phimhay247z.org'
                : 'localhost',
            httpOnly: req.session.cookie.httpOnly,
            sameSite: req.session.cookie.sameSite,
            secure: true,
            maxAge: +process.env.JWT_EXP_OFFSET! * 3600 * 1000,
          });

          res.header('Authorization', encoded);

          return res.json({
            isLogin: true,
            exp_token_hours: +process.env.JWT_EXP_OFFSET!,
            result: {
              id: accountLogedIn.id,
              username: accountLogedIn.username,
              full_name: accountLogedIn.full_name,
              avatar: accountLogedIn.avatar,
              email: accountLogedIn.email,
              auth_type: accountLogedIn.auth_type,
              role: accountLogedIn.role,
              created_at: accountLogedIn.created_at,
            },
          });
        } else {
          return res.json({
            isLogin: false,
            result: 'Login Facebook failed!',
          });
        }
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
          headers: { Authorization: accessToken },
        }
      )
        .then((response: any) => response.json())
        .catch((error) => {
          throw error;
        });

      const account = await Account.findOne({ id: googleUser!.sub });

      if (account == null) {
        await Account.create({
          id: googleUser.sub,
          username: googleUser.name,
          full_name: googleUser.name,
          avatar: googleUser.picture,
          email: googleUser.email,
          auth_type: 'google',
          role: 'normal',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        const newAccount = await Account.findOne({
          id: googleUser.sub,
          auth_type: 'google',
        });

        if (newAccount != null) {
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
                +process.env.JWT_EXP_OFFSET! * 3600,
            },
            process.env.JWT_SIGNATURE_SECRET!,
            {
              algorithm: 'HS256',
              //  expiresIn: process.env.JWT_EXP_OFFSET! + 'h'
            }
          );

          res.set('Access-Control-Expose-Headers', 'Authorization');

          res.cookie('user_token', encoded, {
            domain:
              process.env.NODE_ENV! == 'production'
                ? 'phimhay247z.org'
                : 'localhost',
            httpOnly: req.session.cookie.httpOnly,
            sameSite: req.session.cookie.sameSite,
            secure: true,
            maxAge: +process.env.JWT_EXP_OFFSET! * 3600 * 1000,
          });

          res.header('Authorization', encoded);

          return res.json({
            isSignUp: true,
            exp_token_hours: +process.env.JWT_EXP_OFFSET!,
            result: {
              id: newAccount.id,
              username: newAccount.username,
              full_name: newAccount.full_name,
              avatar: newAccount.avatar,
              email: newAccount.email,
              auth_type: newAccount.auth_type,
              role: newAccount.role,
              created_at: newAccount.created_at,
            },
          });
        } else {
          return res.json({
            isLogin: false,
            result: 'Login Google failed!',
          });
        }
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
              +process.env.JWT_EXP_OFFSET! * 3600,
          },
          process.env.JWT_SIGNATURE_SECRET!,
          {
            algorithm: 'HS256',
            //  expiresIn: process.env.JWT_EXP_OFFSET! + 'h'
          }
        );

        res.set('Access-Control-Expose-Headers', 'Authorization');

        res.cookie('user_token', encoded, {
          domain: req.hostname,
          httpOnly: req.session.cookie.httpOnly,
          sameSite: req.session.cookie.sameSite,
          secure: true,
          maxAge: +process.env.JWT_EXP_OFFSET! * 3600 * 1000,
        });

        res.header('Authorization', encoded);

        return res.json({
          isLogin: true,
          exp_token_hours: process.env.JWT_EXP_OFFSET!,
          result: {
            id: account.id,
            username: account.username,
            full_name: account.full_name,
            avatar: account.avatar,
            email: account.email,
            auth_type: account.auth_type,
            role: account.role,
            created_at: account.created_at,
          },
        });
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
        algorithms: ['HS256'],
      }) as user;

      // console.log(req.headers['user-agent']);

      const isAlive = await jwtRedis.verify(user_token);

      if (isAlive) {
        res.set('Access-Control-Expose-Headers', 'Authorization');

        res.header('Authorization', user_token);

        return res.json({
          isLogin: true,
          result: {
            id: user.id,
            username: user.username,
            full_name: user.full_name,
            avatar: user.avatar,
            email: user.email,
            auth_type: user.auth_type,
            role: user.role,
            created_at: user.created_at,
          },
        });
      } else {
        res.json({ isLogin: false, result: 'Token is no longer active' });
      }
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        res.clearCookie('user_token', {
          domain: req.hostname,
          httpOnly: req.session.cookie.httpOnly,
          sameSite: req.session.cookie.sameSite,
          secure: true,
        });
        return res.json({ isTokenExpired: true, result: 'Token is expired' });
      }

      if (error instanceof jwt.JsonWebTokenError) {
        res.clearCookie('user_token', {
          domain: req.hostname,
          httpOnly: req.session.cookie.httpOnly,
          sameSite: req.session.cookie.sameSite,
          secure: true,
        });
        return res.json({ isInvalidToken: true, result: 'Token is invalid' });
      }

      next(error);
    }
  }

  async signUp(req: Request, res: Response, next: NextFunction) {
    try {
      const signup_token = req.headers.authorization!.replace('Bearer ', '');

      const user = jwt.verify(signup_token, req.body.otp, {
        algorithms: ['HS256'],
      }) as SigupForm;

      const account = await Account.findOne({
        id: user.id,
        auth_type: 'email',
      });

      if (account == null) {
        await Account.create({
          id: user.id,
          username: user.username,
          password: user.password,
          full_name: user.full_name,
          avatar: user.avatar,
          email: user.email,
          auth_type: user.auth_type,
          role: user.role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        res.json({
          isSignUp: true,
          result: 'Sign up account successfully',
        });
      } else {
        res.json({ isAccountExist: true, result: 'Account is already exists' });
      }
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
            auth_type: 'email',
          });

          if (account == null) {
            if (await ValidateEmail(formUser.email)) {
              // if (true) {
              const OTP = GenerateOTP({ length: 6 });

              const encoded = jwt.sign(
                {
                  id: formUser.id,
                  username: formUser.username,
                  password: formUser.password,
                  email: formUser.email,
                  full_name: formUser.full_name,
                  avatar: formUser.avatar,
                  role: 'normal',
                  auth_type: 'email',
                  description: 'Register new account',
                  exp:
                    Math.floor(Date.now() / 1000) +
                    +process.env.OTP_EXP_OFFSET! * 60,
                },
                OTP,
                {
                  algorithm: 'HS256',
                  // expiresIn: +process.env.OTP_EXP_OFFSET! * 60,
                }
              );

              const emailResponse = await SendinblueEmail.VerificationOTP({
                to: formUser.email,
                otp: OTP,
                title: 'Xác nhận đăng ký tài khoản',
                noteExp: +process.env.OTP_EXP_OFFSET!,
              });

              res.set('Access-Control-Expose-Headers', 'Authorization');
              res.header('Authorization', encoded);

              res.json({
                isSended: true,
                exp_offset: +process.env.OTP_EXP_OFFSET! * 60,
                result: 'Send otp email successfully',
              });
            } else {
              res.json({
                isInValidEmail: true,
                result: 'Email is Invalid',
              });
            }
          } else {
            res.json({
              isEmailExist: true,
              result: 'Email is already exists',
            });
          }
          break;
        default:
          next(
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
            auth_type: 'email',
          });

          if (account != null) {
            if (await ValidateEmail(req.body.email)) {
              // if (true) {
              const encoded = jwt.sign(
                {
                  id: account.id,
                  email: account.email,
                  auth_type: 'email',
                  description: 'Forgot your password',
                  exp:
                    Math.floor(Date.now() / 1000) +
                    +process.env.FORGOT_PASSWORD_EXP_OFFSET! * 60,
                },
                process.env.JWT_SIGNATURE_SECRET!,
                {
                  algorithm: 'HS256',
                  // expiresIn: +process.env.FORGOT_PASSWORD_EXP_OFFSET! * 60,
                }
              );

              const app_url =
                process.env.NODE_ENV == 'production'
                  ? process.env.APP_URL!
                  : 'http://localhost:3000';

              const resetPasswordLink = `${app_url}/ForgotPassword?/#reset&token=${encoded}`;

              const emailResponse =
                await SendinblueEmail.VerificationForgotPassword({
                  to: req.body.email,
                  resetPasswordLink: resetPasswordLink,
                  noteExp: +process.env.FORGOT_PASSWORD_EXP_OFFSET!,
                });

              res.json({
                isSended: true,
                exp_offset: +process.env.FORGOT_PASSWORD_EXP_OFFSET! * 60,
                result: 'Send email successfully',
              });
            } else {
              res.json({
                isInValidEmail: true,
                result: 'Email is Invalid',
              });
            }
          } else {
            res.json({
              isEmailExist: true,
              result: 'Email is already exists',
            });
          }
          break;
        default:
          next(
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
        algorithms: ['HS256'],
      });

      await jwtRedis.sign(user_token, {
        exp: +process.env.JWT_EXP_OFFSET! * 60 * 60,
      });

      res.clearCookie('user_token', {
        domain:
          process.env.NODE_ENV! == 'production'
            ? 'phimhay247z.org'
            : 'localhost',
        httpOnly: req.session.cookie.httpOnly,
        sameSite: req.session.cookie.sameSite,
        secure: true,
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
          secure: true,
        });

        return res.json({ isLogout: true, result: 'Log out successfully' });
      }

      next(error);
    }
  }
}

export default new AuthController();
