const List = require('../models/List');
const MovieDetail = require('../models/Movie');
const TVDetail = require('../models/TV');
const config = require('../../../package.json');
const API_KEY = config.projectConfig.apiKey;
const errorMsg = require('../../until/errorMsg');
const { ItemList } = require('../models/ItemList');

const { multipleMongooseToObject } = require('../../until/mongoose');
const { mongooseToObject } = require('../../until/mongoose');

class ListController {
  // GET /

  index(req, res, next) {
    try {
      if (req.query.api == API_KEY) {
        List.findOne({ id: req.params.slug })
          .then((listResponse) => {
            res.json(mongooseToObject(listResponse));
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

  addItem(req, res, next) {
    try {
      if (req.query.api == API_KEY) {
        if (req.body.media_type === 'movie') {
          MovieDetail.findOne({
            id: req.body.media_id,
          })
            .then((dataMovies) => {
              // res.json(mongooseToObject(listResponse));
              const itemList = new ItemList({
                ...mongooseToObject(dataMovies),
                media_type: 'movie',
              });
              // itemList.save();
              // console.log(itemList);
              // res.json(mongooseToObject(dataMovies));

              List.findOneAndUpdate(
                { id: req.params.slug },
                { $addToSet: { items: itemList } },
                { new: true },
                (err, doc) => {
                  if (err) {
                    console.log('Something wrong when updating data!');
                  }
                }
              );
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
              // res.json(mongooseToObject(listResponse));

              const itemList = new ItemList({
                ...mongooseToObject(dataTV),
                media_type: 'tv',
              });
              // itemList.save();
              // console.log(itemList);
              // res.json(mongooseToObject(dataMovies));

              List.findOneAndUpdate(
                { id: req.params.slug },
                { $addToSet: { items: itemList } },
                { new: true },
                (err, doc) => {
                  if (err) {
                    console.log('Something wrong when updating data!');
                  }
                }
              );
            })
            .catch((error) => {
              res.status(400).json(errorMsg.errDefault);
              next(error);
            });
        }
      } else {
        res.status(400).json(errorMsg.errApiKey);
      }
    } catch (error) {
      res.status(400).json(errorMsg.errDefault);
    } finally {
    }
  }

  removeItem(req, res, next) {
    try {
      if (req.query.api == API_KEY) {
        List.findOneAndUpdate(
          { id: req.params.slug },
          { $pull: { items: { id: req.body.media_id } } },
          { new: true },
          (err, doc) => {
            if (err) {
              console.log('Something wrong when updating data!');
            }
          }
        );
      } else {
        res.status(400).json(errorMsg.errApiKey);
      }
    } catch (error) {
      res.status(400).json(errorMsg.errDefault);
    } finally {
    }
  }

  newList(req, res, next) {
    try {
      if (req.query.api == API_KEY) {
        List.findOneAndUpdate(
          { id: req.params.slug },
          { $pull: { items: { id: req.body.media_id } } },
          { new: true },
          (err, doc) => {
            if (err) {
              console.log('Something wrong when updating data!');
            }
          }
        );
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
