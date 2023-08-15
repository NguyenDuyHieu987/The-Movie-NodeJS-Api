const WatchList = require('../models/WatchList');
const MovieDetail = require('../models/Movie');
const TVDetail = require('../models/TV');
const config = require('../../../package.json');
const API_KEY = config.projectConfig.apiKey;
const errorMsg = require('../../until/errorMsg');

const { multipleMongooseToObject } = require('../../until/mongoose');
const { mongooseToObject } = require('../../until/mongoose');
const { ItemList } = require('../models/ItemList');

class WatchListController {
  // GET /

  index(req, res, next) {
    try {
      if (req.query.api == API_KEY) {
        switch (req.params.slug) {
          case 'all':
            WatchList.findOne(
              // {},
              {
                id: req.params.accountid,
                // results: {
                //   $slice: [
                //     (req.query.page ? +req.query.page - 1 : 0) * 19,
                //     req.query.page ? +req.query.page * 19 : 19,
                //   ],
                // },
              }
            )
              // .skip((req.query.page - 1) * 20)
              // .limit(20)
              .then((listResponse) => {
                res.json(mongooseToObject(listResponse));
              })
              .catch((error) => {
                res.status(400).json(errorMsg.errDefault);
                next(error);
              });
            break;
          case 'movie':
            WatchList.aggregate([
              { $match: { id: req.params.accountid } },
              {
                $project: {
                  results: {
                    $filter: {
                      input: '$results',
                      as: 'item',
                      cond: { $eq: ['$$item.media_type', 'movie'] },
                    },
                  },
                },
              },
            ])
              .then((listResponse) => {
                // res.json(multipleMongooseToObject(listResponse));
                res.json(listResponse);
              })
              .catch((error) => {
                console.log(error);
                res.status(400).json(errorMsg.errDefault);
                next(error);
              });
            break;
          case 'tv':
            break;
          default:
            res.status(400).json(errorMsg.errDefault);
            break;
        }
      } else {
        res.status(400).json(errorMsg.errApiKey);
      }
    } catch (error) {
      res.status(400).json(errorMsg.errDefault);
    } finally {
    }
  }

  handleWatchList(req, res, next) {
    try {
      if (req.query.api == API_KEY) {
        console.log(req.body.media_type);
        if (req.body.media_type === 'movie') {
          MovieDetail.findOne({
            id: req.body.media_id,
          })
            .then((dataMovies) => {
              if (req.body.watchlist === true) {
                const itemList = new ItemList({
                  ...mongooseToObject(dataMovies),
                  media_type: 'movie',
                });
                WatchList.findOneAndUpdate(
                  { id: req.params.slug },
                  { $addToSet: { results: itemList } },
                  { new: true },
                  (err, doc) => {
                    if (err) {
                      console.log(err);
                      console.log('Something wrong when updating data!');
                    }
                  }
                );
              }
            })
            .catch((error) => {
              res.status(400).json(errorMsg.errDefault);
              next(error);
            });
        } else if (req.body.media_type === 'tv') {
          TVDetail.findOne({
            id: req.body.media_id,
          })
            .then((dataTV) => {
              if (req.body.watchlist === true) {
                const itemList = new ItemList({
                  ...mongooseToObject(dataTV),
                  media_type: 'tv',
                });

                WatchList.findOneAndUpdate(
                  { id: req.params.slug },
                  { $addToSet: { results: itemList } },
                  { new: true },
                  (err, doc) => {
                    if (err) {
                      console.log('Something wrong when updating data!');
                    }
                  }
                );
              }
            })
            .catch((error) => {
              res.status(400).json(errorMsg.errDefault);
              next(error);
            });
        } else if (req.body.media_type === undefined) {
          if (req.body.watchlist === false) {
            WatchList.findOneAndUpdate(
              { id: req.params.slug },
              { $pull: { results: { id: req.body.media_id } } },
              { new: true },
              (err, doc) => {
                if (err) {
                  console.log('Something wrong when updating data!');
                }
              }
            );
          }
        }
      } else {
        res.status(400).json(errorMsg.errApiKey);
      }
    } catch (error) {
      res.status(400).json(errorMsg.errDefault);
    } finally {
    }
  }
}

module.exports = new WatchListController();
