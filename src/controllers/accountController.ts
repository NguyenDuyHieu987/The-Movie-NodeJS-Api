import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import Account from '@/models/account';
import jwtRedis from '@/utils/jwtRedis';
import type { user } from '@/types';
import GenerateOTP from '@/utils/generateOTP';
import sendinblueEmail from '@/utils/sendinblueEmail';
import * as argon2 from 'argon2';

class AccountController {
  constructor() {}

  async confirm(req: Request, res: Response, next: NextFunction) {
    try {
      const user_token =
        req.cookies.user_token ||
        req.headers.authorization!.replace('Bearer ', '');

      const user = jwt.verify(user_token, process.env.JWT_SIGNATURE_SECRET!, {
        algorithms: ['HS256'],
      }) as user;

      const formUser = req.body;

      const isAlive = await jwtRedis
        .setPrefix('user_logout')
        .verify(user_token);

      if (!isAlive) {
        return res.json({
          isTokenAlive: false,
          result: 'Token is no longer active',
        });
      }

      const OTP: string = GenerateOTP({ length: 6 });
      let encoded: string = '';
      let emailResponse: any = null;

      switch (req.params.type) {
        case 'email':
          encoded = jwt.sign(
            {
              id: user.id,
              email: user.email,
              auth_type: 'email',
              description: 'Verify your Email',
              exp:
                Math.floor(Date.now() / 1000) +
                +process.env.OTP_EXP_OFFSET! * 60,
            },
            OTP,
            {
              algorithm: 'HS256',
              // expiresIn: +process.env.OTP_EXP_OFFSET! * 60 + 's',
            }
          );

          emailResponse = await sendinblueEmail.VerificationOTP({
            to: user.email,
            otp: OTP,
            title: 'Xác nhận Email của bạn',
            noteExp: +process.env.OTP_EXP_OFFSET!,
          });

          res.cookie('verify_your_email', encoded, {
            domain: req.hostname,
            httpOnly: req.session.cookie.httpOnly,
            sameSite: req.session.cookie.sameSite,
            secure: true,
            maxAge: +process.env.OTP_EXP_OFFSET! * 60 * 1000,
          });
          break;
        case 'change-password':
          const account = await Account.findOne({
            email: user.email,
            auth_type: 'email',
          });

          if (account != null) {
            const isValidPassword = await argon2.verify(
              account.password!,
              formUser.old_password,
              {
                secret: Buffer.from(process.env.APP_TOKEN_SECRET!),
              }
            );

            if (isValidPassword) {
              encoded = jwt.sign(
                {
                  id: user.id,
                  email: user.email,
                  auth_type: 'email',
                  old_password: formUser.old_password,
                  new_password: formUser.new_password,
                  logout_all_device: formUser.logout_all_device,
                  description: 'Change your password',
                  exp:
                    Math.floor(Date.now() / 1000) +
                    +process.env.OTP_EXP_OFFSET! * 60,
                },
                OTP,
                {
                  algorithm: 'HS256',
                  // expiresIn: +process.env.OTP_EXP_OFFSET! * 60 + 's',
                }
              );

              emailResponse = await sendinblueEmail.VerificationOTP({
                to: user.email,
                otp: OTP,
                title: 'Xác nhận thay đổi mật khẩu của bạn',
                noteExp: +process.env.OTP_EXP_OFFSET!,
              });

              res.cookie('verify_change_password_token', encoded, {
                domain: req.hostname,
                httpOnly: req.session.cookie.httpOnly,
                sameSite: req.session.cookie.sameSite,
                secure: true,
                maxAge: +process.env.OTP_EXP_OFFSET! * 60 * 1000,
              });
            } else {
              return res.json({
                isWrongPassword: true,
                result: 'Wrong password',
              });
            }
          } else {
            createHttpError.NotFound(`Account is not found`);
          }
          break;
        case 'change-email':
          encoded = jwt.sign(
            {
              id: user.id,
              email: user.email,
              auth_type: 'email',
              description: 'Change your Email',
              exp:
                Math.floor(Date.now() / 1000) +
                +process.env.OTP_EXP_OFFSET! * 60,
            },
            OTP,
            {
              algorithm: 'HS256',
              // expiresIn: +process.env.OTP_EXP_OFFSET! * 60 + 's',
            }
          );

          emailResponse = await sendinblueEmail.VerificationOTP({
            to: user.email,
            otp: OTP,
            title: 'Xác nhận thay đổi Email của bạn',
            noteExp: +process.env.OTP_EXP_OFFSET!,
          });

          break;
        default:
          return next(
            createHttpError.NotFound(
              `Verify account with type ${req.params.type} not found`
            )
          );
          break;
      }

      if (encoded.length == 0) {
        return next(
          createHttpError.InternalServerError(`Verify account failed`)
        );
      } else {
        // res.set('Access-Control-Expose-Headers', 'Authorization');
        // res.header('Authorization', encoded);

        return res.json({
          isSended: true,
          exp_offset: +process.env.OTP_EXP_OFFSET! * 60,
          result: 'Send otp email successfully',
        });
      }
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
      }

      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const user_token =
        req.cookies.user_token ||
        req.headers.authorization!.replace('Bearer ', '');

      const user = jwt.verify(user_token, process.env.JWT_SIGNATURE_SECRET!, {
        algorithms: ['HS256'],
      }) as user;

      // const verify_token = req.headers.authorization!.replace('Bearer ', '');
      const verify_token = req.cookies.verify_change_password_token;

      if (verify_token == undefined) {
        return res.json({ isOTPExpired: true, result: 'OTP is expired' });
      }

      const isAlive = await jwtRedis
        .setPrefix('verify_change_password_token')
        .verify(verify_token);

      if (!isAlive) {
        res.json({ success: false, result: 'Token is no longer active' });
      }

      // const decodeChangePassword = jwt.verify(verify_token, req.body.otp, {
      //   algorithms: ['HS256'],
      // }) as {
      //   old_password: string;
      //   new_password: string;
      //   logout_all_device: string;
      // };

      jwt.verify(
        verify_token,
        req.body.otp,
        {
          algorithms: ['HS256'],
        },
        async (err, decoded) => {
          if (err instanceof jwt.TokenExpiredError) {
            return res.json({ isOTPExpired: true, result: 'OTP is expired' });
          }

          if (err instanceof jwt.JsonWebTokenError) {
            return res.json({ isInvalidOTP: true, result: 'OTP is invalid' });
          }

          const decodeChangePassword = decoded as {
            old_password: string;
            new_password: string;
            logout_all_device: string;
          };

          const result = await Account.updateOne(
            {
              id: user.id,
              email: user.email,
              auth_type: 'email',
              password: decodeChangePassword.old_password,
            },
            {
              $set: {
                password: decodeChangePassword.new_password,
              },
            }
          );

          if (result.modifiedCount == 1) {
            res.clearCookie('verify_change_password_token', {
              httpOnly: req.session.cookie.httpOnly,
              sameSite: req.session.cookie.sameSite,
              secure: true,
            });

            const logOutAllDevice =
              decodeChangePassword.logout_all_device == 'true';

            if (logOutAllDevice) {
              jwtRedis.setPrefix('user_logout');

              await jwtRedis.sign(user_token, {
                exp: +process.env.JWT_EXP_OFFSET! * 60 * 60,
              });

              jwtRedis.setPrefix('verify_change_password_token');

              await jwtRedis.sign(verify_token, {
                exp: +process.env.OTP_EXP_OFFSET! * 60,
              });

              const encoded = jwt.sign(
                {
                  id: user.id,
                  username: user.username,
                  password: decodeChangePassword.new_password,
                  email: user.email,
                  full_name: user.full_name,
                  avatar: user.avatar,
                  role: user.role,
                  auth_type: user.auth_type,
                  created_at: user.created_at,
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
                domain: req.hostname,
                httpOnly: req.session.cookie.httpOnly,
                sameSite: req.session.cookie.sameSite,
                secure: true,
                maxAge: +process.env.JWT_EXP_OFFSET! * 3600 * 1000,
              });

              res.header('Authorization', encoded);
            }

            return res.json({
              success: true,
              logout_all_device: logOutAllDevice,
              result: 'Change password successfully',
            });
          } else {
            return res.json({
              success: false,
              result: 'Change password failed',
            });
          }
        }
      );
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
      }

      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const verify_token = req.headers.authorization!.replace('Bearer ', '');

      const formUser = req.body;

      const user = jwt.verify(verify_token, formUser.otp, {
        algorithms: ['HS256'],
      }) as user & {
        old_password: string;
        new_password: string;
      };

      const result = await Account.updateOne(
        {
          id: user.id,
          email: user.email,
          auth_type: 'email',
        },
        {
          $set: {
            email: formUser.new_email,
          },
        }
      );

      if (result.modifiedCount == 1) {
        return res.json({ success: true });
      } else {
        return res.json({
          success: false,
        });
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

  async changeEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const verify_token = req.headers.authorization!.replace('Bearer ', '');

      const formUser = req.body;

      const user = jwt.verify(verify_token, formUser.otp, {
        algorithms: ['HS256'],
      }) as user & {
        old_password: string;
        new_password: string;
      };

      const result = await Account.updateOne(
        {
          id: user.id,
          email: user.email,
          auth_type: 'email',
        },
        {
          $set: {
            email: formUser.new_email,
          },
        }
      );

      if (result.modifiedCount == 1) {
        return res.json({ success: true });
      } else {
        return res.json({
          success: false,
        });
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
}

export default new AccountController();
