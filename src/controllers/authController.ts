import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import List from '@/models/list';
import WatchList from '@/models/WatchList';
import Account from '@/models/account';
import SendinblueEmail from '@/utils/sendinblueEmail';
import GenerateOTP from '@/utils/generateOTP';

class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
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
              exp: Math.floor(Date.now() / 1000) + +process.env.JWT_EXP_OFFSET!,
            },
            process.env.JWT_SIGNATURE_SECRET!,
            { algorithm: 'HS256' }
          );

          res.set('Access-Control-Expose-Headers', 'Authorization');

          return res.header('Authorization', encoded).json({
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

  async loginFacebook(req: Request, res: Response, next: NextFunction) {
    try {
      const accessToken: string = req.headers.authorization
        ?.toString()
        .replace('Bearer ', '') as string;

      const facebookUser: any = await fetch(
        `https://graph.facebook.com/v15.0/me?access_token=${accessToken}&fields=id,name,email,picture`
      ).then((response: any) => response.json());

      const account = await Account.findOne({ id: facebookUser!.id });

      if (account == null) {
        Account.collection.insertOne({
          id: facebookUser.id,
          username: facebookUser.name,
          full_name: facebookUser.name,
          avatar: facebookUser.picture.data.url,
          email: facebookUser.email,
          auth_type: 'facebook',
          role: 'normal',
          created_at: Date.now(),
          updated_at: Date.now(),
        });

        const newAccount = await Account.findOne({
          id: facebookUser.id,
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
              exp: Math.floor(Date.now() / 1000) + +process.env.JWT_EXP_OFFSET!,
            },
            process.env.JWT_SIGNATURE_SECRET!,
            { algorithm: 'HS256' }
          );

          res.set('Access-Control-Expose-Headers', 'Authorization');

          return res.header('Authorization', encoded).json({
            isSignUp: true,
            exp_token_hours: process.env.JWT_EXP_OFFSET!,
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
              exp: Math.floor(Date.now() / 1000) + +process.env.JWT_EXP_OFFSET!,
            },
            process.env.JWT_SIGNATURE_SECRET!,
            { algorithm: 'HS256' }
          );

          res.set('Access-Control-Expose-Headers', 'Authorization');

          return res.header('Authorization', encoded).json({
            isLogin: true,
            exp_token_hours: process.env.JWT_EXP_OFFSET!,
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

  async loginGoogle(req: Request, res: Response, next: NextFunction) {
    try {
      const accessToken: string = req.headers.authorization
        ?.toString()
        .replace('Bearer ', '') as string;

      const googleUser: any = await fetch(
        `https://www.googleapis.com/oauth2/v3/userinfo`,
        {
          headers: { Authorization: accessToken },
        }
      ).then((response: any) => response.json());

      const account = await Account.findOne({ id: googleUser!.sub });

      if (account == null) {
        Account.collection.insertOne({
          id: googleUser.sub,
          username: googleUser.name,
          full_name: googleUser.name,
          avatar: googleUser.picture,
          email: googleUser.email,
          auth_type: 'google',
          role: 'normal',
          created_at: Date.now(),
          updated_at: Date.now(),
        });

        const newAccount = await Account.findOne({
          id: googleUser.sub,
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
              exp: Math.floor(Date.now() / 1000) + +process.env.JWT_EXP_OFFSET!,
            },
            process.env.JWT_SIGNATURE_SECRET!,
            { algorithm: 'HS256' }
          );

          res.set('Access-Control-Expose-Headers', 'Authorization');

          return res.header('Authorization', encoded).json({
            isSignUp: true,
            exp_token_hours: process.env.JWT_EXP_OFFSET!,
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
            exp: Math.floor(Date.now() / 1000) + +process.env.JWT_EXP_OFFSET!,
          },
          process.env.JWT_SIGNATURE_SECRET!,
          { algorithm: 'HS256' }
        );

        res.set('Access-Control-Expose-Headers', 'Authorization');

        return res.header('Authorization', encoded).json({
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

  getUserByToken(req: Request, res: Response, next: NextFunction) {
    try {
      Account.findOne({
        user_token: req.body.user_token,
      })
        .then((dataAccount: any) => {
          res.json({
            isLogin: true,
            result: {
              id: dataAccount.id,
              user_name: dataAccount.user_name,
              full_name: dataAccount.created_by,
              avatar: dataAccount.avatar,
              email: dataAccount.email,
              user_token: dataAccount.user_token,
            },
          });
        })
        .catch((error) => {
          res.json({ isLogin: false, result: 'Invalid token' });
          next(error);
        });
    } catch (error) {
      next(error);
    }
  }

  signup(req: Request, res: Response, next: NextFunction) {
    try {
      Account.find({
        email: req.body.email,
      })
        .then((dataAccount) => {
          if (dataAccount.length == 0) {
            const formData = req.body;
            const account = new Account(formData);
            account.save();

            const list = new List({
              created_by: req.body.user_name,
              description: 'List which users are added',
              favorite_count: 0,
              id: req.body.id,
              items: [],
              iso_639_1: 'en',
              name: 'List',
              poster_path: null,
            });
            list.save();

            const watchList = new WatchList({
              created_by: req.body.user_name,
              description: 'Videos which users played',
              favorite_count: 0,
              id: req.body.id,
              item_count: 0,
              iso_639_1: 'en',
              name: 'WatchList',
              poster_path: null,
              results: [],
            });
            watchList.save();

            res.json({ isSignUp: true, result: 'Sign up successfully' });
          } else {
            res.json({ isSignUp: false, result: 'Email already exist' });
          }
        })
        .catch((error) => {
          next(error);
        });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
