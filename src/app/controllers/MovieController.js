const MovieDetail = require('../models/Movie');
const DataMovies = require('../models/DataMovies');
const config = require('../../../package.json');
const API_KEY = config.projectConfig.apiKey;
const errorMsg = require('../../until/errorMsg');

const { multipleMongooseToObject } = require('../../until/mongoose');
const { mongooseToObject } = require('../../until/mongoose');

class MovieController {
  // GET /

  index(req, res, next) {
    try {
      if (req.query.api == API_KEY) {
        switch (req.params.slug) {
          case 'phimle':
            DataMovies.PhimLe.findOne({
              page: req.query.page === undefined ? 1 : req.query.page,
            })
              .then((dataMovies) => {
                res.json(mongooseToObject(dataMovies));
              })
              .catch((error) => {
                res.status(400).json(errorMsg.errDefault);
                next(error);
              });
            break;
          case 'nowplaying':
            DataMovies.Nowplaying.findOne({
              page: req.query.page === undefined ? 1 : req.query.page,
            })
              .then((dataMovies) => {
                res.json(mongooseToObject(dataMovies));
              })
              .catch((error) => {
                res.status(400).json(errorMsg.errDefault);
                next(error);
              });
            break;
          case 'upcoming':
            DataMovies.Upcoming.findOne({
              page: req.query.page === undefined ? 1 : req.query.page,
            })
              .then((dataMovies) => {
                res.json(mongooseToObject(dataMovies));
              })
              .catch((error) => {
                res.status(400).json(errorMsg.errDefault);
                next(error);
              });
            break;
          case 'popular':
            DataMovies.Popular.findOne({
              page: req.query.page === undefined ? 1 : req.query.page,
            })
              .then((dataMovies) => {
                res.json(mongooseToObject(dataMovies));
              })
              .catch((error) => {
                res.status(400).json(errorMsg.errDefault);
                next(error);
              });
            break;
          case 'toprated':
            DataMovies.Toprated.findOne({
              page: req.query.page === undefined ? 1 : req.query.page,
            })
              .then((dataMovies) => {
                res.json(mongooseToObject(dataMovies));
              })
              .catch((error) => {
                res.status(400).json(errorMsg.errDefault);
                next(error);
              });
            break;
          default:
            if (!req.query.append_to_response) {
              MovieDetail.findOne({ id: req.params.slug })
                .select(['-credits', '-similar', '-recommendations'])
                .then((dataMovies) => {
                  // dataMovies == null
                  //   ? res.status(404).json(errorMsg.errDefault)
                  //   :

                  res.json(mongooseToObject(dataMovies));
                })
                .catch((error) => {
                  res.status(400).json(errorMsg.errDefault);
                  next(error);
                });
            } else {
              MovieDetail.findOne({ id: req.params.slug })
                .select(['-credits', '-similar', '-recommendations'])
                .then((dataMovies) => {
                  // dataMovies == null
                  //   ? res.status(404).json(errorMsg.errDefault)
                  //   :
                  MovieDetail.findOne({ id: req.params.slug })
                    .select(req.query.append_to_response.split(','))
                    .then((dataParams) => {
                      // dataMovies == null
                      //   ? res.status(404).json(errorMsg.errDefault)
                      //   :

                      res.json({
                        ...mongooseToObject(dataMovies),
                        ...mongooseToObject(dataParams),
                      });
                    })
                    .catch((error) => {
                      res.status(400).json(errorMsg.errDefault);
                      next(error);
                    });

                  // res.json(mongooseToObject(dataMovies));
                })
                .catch((error) => {
                  res.status(400).json(errorMsg.errDefault);
                  next(error);
                });
            }
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

  async update(req, res, next) {
    try {
      if (req.query.api == API_KEY) {
        switch (req.params.slug1) {
          case 'rating':
            let doc = await MovieDetail.findOne({
              id: req.params.movieid,
            }).catch((error) => {
              res.status(400).json(errorMsg.errDefault);
              next(error);
            });

            var newRating =
              (doc.vote_count * doc.vote_average + req.body.value) /
              (doc.vote_count + 1);
            doc.vote_average = newRating;
            doc.vote_count += 1;
            await doc.save();

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

module.exports = new MovieController();
