import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import Account from '@/models/account';
import jwtRedis from '@/utils/jwtRedis';
import type { user } from '@/types';
import GenerateOTP from '@/utils/generateOTP';
import sendinblueEmail from '@/utils/sendinblueEmail';

class AccountController {
  constructor() {
    jwtRedis.setPrefix('user_logout');
  }

  async verify(req: Request, res: Response, next: NextFunction) {
    try {
      const user_token = req.headers.authorization!.replace('Bearer ', '');

      const user = jwt.verify(user_token, process.env.JWT_SIGNATURE_SECRET!, {
        algorithms: ['HS256'],
      }) as user;

      const formUser = req.body;

      const isAlive = await jwtRedis.verify(user_token);

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
              // expiresIn: +process.env.OTP_EXP_OFFSET! * 60,
            }
          );

          emailResponse = await sendinblueEmail.VerificationOTP({
            to: formUser.email,
            otp: OTP,
            noteExp: +process.env.OTP_EXP_OFFSET!,
          });
          break;
        case 'change-password':
          const account = await Account.findOne({
            email: user.email,
            auth_type: 'email',
            password: formUser.old_password,
          });

          if (account != null) {
            encoded = jwt.sign(
              {
                id: user.id,
                email: user.email,
                auth_type: 'email',
                old_password: formUser.old_password,
                new_password: formUser.new_password,
                description: 'Change your password',
                exp:
                  Math.floor(Date.now() / 1000) +
                  +process.env.OTP_EXP_OFFSET! * 60,
              },
              OTP,
              {
                algorithm: 'HS256',
              }
            );

            emailResponse = await sendinblueEmail.VerificationOTP({
              to: formUser.email,
              otp: OTP,
              title: 'Xác nhận thay đổi mật khẩu của bạn',
              noteExp: +process.env.OTP_EXP_OFFSET!,
            });
          } else {
            return res.json({
              isWrongPassword: true,
              result: 'Wrong password',
            });
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
            }
          );

          emailResponse = await sendinblueEmail.VerificationOTP({
            to: formUser.email,
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
        res.set('Access-Control-Expose-Headers', 'Authorization');

        res.header('Authorization', encoded).json({
          isSended: true,
          exp_offset: +process.env.OTP_EXP_OFFSET! * 60,
          result: 'Send otp email successfully',
        });
      }
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const user_token = req.headers.authorization!.replace('Bearer ', '');

      const user = jwt.verify(user_token, req.body.otp, {
        algorithms: ['HS256'],
      }) as user & {
        old_password: string;
        new_password: string;
      };

      const isAlive = await jwtRedis.verify(user_token);

      if (!isAlive) {
        return res.json({
          isTokenAlive: false,
          result: 'Token is no longer active',
        });
      }

      const result = await Account.updateOne(
        {
          id: user.id,
          email: user.email,
          auth_type: 'email',
          password: user.old_password,
        },
        {
          $set: {
            password: user.new_password,
          },
        }
      );

      if (result.modifiedCount == 1) {
        res.json({ success: true, result: 'Change password successfully' });
      } else {
        res.json({ success: false, result: 'Change password failed' });
      }
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.json({ isTokenExpired: true, result: 'Token is expired' });
      }

      if (error instanceof jwt.JsonWebTokenError) {
        return res.json({ isInvalidToken: true, result: 'Token is invalid' });
      }

      next(error);
    }
  }

  async changeEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const user_token = req.headers.authorization!.replace('Bearer ', '');
      const formUser = req.body;

      const user = jwt.verify(user_token, formUser.otp, {
        algorithms: ['HS256'],
      }) as user & {
        old_password: string;
        new_password: string;
      };

      const isAlive = await jwtRedis.verify(user_token);

      if (!isAlive) {
        return res.json({
          isTokenAlive: false,
          result: 'Token is no longer active',
        });
      }

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
        res.json({ success: true });
      } else {
        res.json({
          success: false,
        });
      }
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.json({ isTokenExpired: true, result: 'Token is expired' });
      }

      if (error instanceof jwt.JsonWebTokenError) {
        return res.json({ isInvalidToken: true, result: 'Token is invalid' });
      }

      next(error);
    }
  }
}

export default new AccountController();
