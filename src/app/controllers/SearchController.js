const DataMovies = require('../models/DataMovies');
const MovieDetail = require('../models/Movie');
const TVdetail = require('../models/TV');
const config = require('../../../package.json');
const API_KEY = config.projectConfig.apiKey;
const errorMsg = require('../../until/errorMsg');

const { multipleMongooseToObject } = require('../../until/mongoose');
const { mongooseToObject } = require('../../until/mongoose');

class SearchController {
  // GET /

  //   detail(req, res, next) {
  //     if (req.query.api == API_KEY) {

  //     } else {
  //       res.status(400).json(errorMsg.errApiKey);
  //     }
  //   }

  index(req, res, next) {
    try {
      if (req.query.api == API_KEY) {
        switch (req.params.slug) {
          case 'multi':
            MovieDetail.find({
              $or: [
                { name: { $regex: req.query.query, $options: 'i' } },
                { title: { $regex: req.query.query, $options: 'i' } },
              ],
            })
              .skip((req.query.page - 1) * 10)
              .limit(10)
              .then((dataMovies) => {
                // res.json(multipleMongooseToObject(dataMovies));
                TVdetail.find({
                  $or: [
                    { name: { $regex: req.query.query, $options: 'i' } },
                    { title: { $regex: req.query.query, $options: 'i' } },
                  ],
                })
                  .skip((req.query.page - 1) * 10)
                  .limit(10)
                  .then((dataTV) => {
                    res.json({
                      results: multipleMongooseToObject(dataMovies).concat(
                        multipleMongooseToObject(dataTV)
                      ),
                    });
                    // res.json(multipleMongooseToObject(dataMovies));
                  })
                  .catch((error) => {
                    res.status(400).json(errorMsg.errDefault);
                    next(error);
                  });
              })
              .catch((error) => {
                res.status(400).json(errorMsg.errDefault);
                next(error);
              });

            break;
          case 'movie':
            MovieDetail.find({
              $or: [
                { name: { $regex: req.query.query, $options: 'i' } },
                { title: { $regex: req.query.query, $options: 'i' } },
              ],
            })
              .skip((req.query.page - 1) * 20)
              .limit(20)
              .then((dataMovies) => {
                res.json({
                  results: multipleMongooseToObject(dataMovies),
                });
              })
              .catch((error) => {
                res.status(400).json(errorMsg.errDefault);
                next(error);
              });
            break;
          case 'tv':
            TVdetail.find({
              $or: [
                { name: { $regex: req.query.query, $options: 'i' } },
                { title: { $regex: req.query.query, $options: 'i' } },
              ],
            })
              .skip((req.query.page - 1) * 20)
              .limit(20)
              .then((dataMovies) => {
                res.json({
                  results: multipleMongooseToObject(dataMovies),
                });
              })
              .catch((error) => {
                res.status(400).json(errorMsg.errDefault);
                next(error);
              });
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
}

module.exports = new SearchController();
