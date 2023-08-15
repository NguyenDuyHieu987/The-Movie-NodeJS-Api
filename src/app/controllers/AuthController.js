const List = require('../models/List');
const WatchList = require('../models/WatchList');
const Account = require('../models/Account');
const config = require('../../../package.json');
const API_KEY = config.projectConfig.apiKey;
const errorMsg = require('../../until/errorMsg');

const { multipleMongooseToObject } = require('../../until/mongoose');
const { mongooseToObject } = require('../../until/mongoose');

class ListController {
  // GET /

  async signin(req, res, next) {
    try {
      if (req.query.api == API_KEY) {
        if (req.body.id) {
          Account.findOne({
            id: req.body.id,
          })
            .then((dataAccount) => {
              if (dataAccount == null) {
                const formData = req.body;
                const account = new Account(formData);
                account.save();

                Account.findOne({
                  id: req.body.id,
                }).then((dataSignUp) => {
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

                  Account.findOne({
                    id: req.body.id,
                  })
                    .then((dataSignUp) => {
                      res.json({ isSignUp: true, result: dataSignUp });
                    })
                    .catch((error) => {
                      res.json({ isSignUp: false, result: 'Sign Up failed' });
                      next(error);
                    });
                });
              } else {
                Account.findOneAndUpdate(
                  { id: req.body.id },
                  {
                    $set: {
                      user_token: req.body.user_token,
                      avatar: req.body.avatar,
                    },
                  },
                  { new: true },
                  (err, doc) => {
                    if (err) {
                      console.log('Something wrong when updating data!');
                    }
                    res.json({ isLogin: true, result: doc });
                  }
                );
              }
            })
            .catch((error) => {
              res.status(400).json(errorMsg.errDefault);
              next(error);
            });
        } else {
          Account.findOne({
            email: req.body.email,
          })
            .then((dataAccount) => {
              if (dataAccount.password === req.body.password) {
                Account.findOneAndUpdate(
                  { password: req.body.password },
                  { $set: { user_token: req.body.user_token } },
                  { new: true },
                  (err, doc) => {
                    if (err) {
                      console.log('Something wrong when updating data!');
                    }
                    res.json({
                      isLogin: true,
                      result: {
                        id: doc.id,
                        user_name: doc.user_name,
                        full_name: doc.created_by,
                        avatar: doc.avatar,
                        email: doc.email,
                        user_token: doc.user_token,
                      },
                    });
                  }
                );
              } else {
                res.json({ isLogin: false, result: 'Wrong Password' });
              }
            })
            .catch((error) => {
              res.json({ success: false, result: 'Account is not exist' });
              next(error);
            });

          // let doc = await Account.findOne({
          //   email: req.body.email,
          // }).catch((error) => {
          //   res.json({ success: false, result: 'Account is not exist' });
          //   next(error);
          // });

          // console.log(doc);

          // if (doc === null) {
          //   res.json({ success: false, result: 'Account is not exist' });
          //   next(error);
          // } else {
          //   if (doc.password === req.body.password) {
          //     doc.user_token = req.body.user_token;
          //     await doc.save();
          //     res.json({ isLogin: true, result: doc });
          //   } else {
          //     res.json({ isLogin: false, result: 'Wrong Password' });
          //   }
          // }
        }
      } else {
        res.status(400).json(errorMsg.errApiKey);
      }
    } catch (error) {
      res.status(400).json(errorMsg.errDefault);
    } finally {
    }
  }

  signup(req, res, next) {
    try {
      if (req.query.api == API_KEY) {
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
            res.status(400).json(errorMsg.errDefault);
            next(error);
          });
      } else {
        res.status(400).json(errorMsg.errApiKey);
      }
    } catch (error) {
      res.status(400).json(errorMsg.errDefault);
    } finally {
    }
  }

  getUserByUserToken(req, res, next) {
    try {
      if (req.query.api == API_KEY) {
        Account.findOne({
          user_token: req.body.user_token,
        })
          .then((dataAccount) => {
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
      } else {
        res.status(400).json(errorMsg.errApiKey);
      }
    } catch (error) {
      res.status(400).json(errorMsg.errDefault);
    } finally {
    }
  }
}

module.exports = new ListController();
