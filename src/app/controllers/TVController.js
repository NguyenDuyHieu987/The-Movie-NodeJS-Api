const DataMovies = require('../models/DataMovies');
const Season = require('../models/Season');
const TVdetail = require('../models/TV');
const config = require('../../../package.json');
const API_KEY = config.projectConfig.apiKey;
const errorMsg = require('../../until/errorMsg');

const { multipleMongooseToObject } = require('../../until/mongoose');
const { mongooseToObject } = require('../../until/mongoose');
const { response } = require('express');

class TVController {
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
          case 'phimbo':
            DataMovies.PhimBo.findOne({
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
          case 'airingtoday':
            DataMovies.TVAiringToday.findOne({
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
          case 'ontheair':
            DataMovies.TVOnTheAir.findOne({
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
            DataMovies.TVPopular.findOne({
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
            DataMovies.TVTopRated.findOne({
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
            // const arr = req.query.append_to_response.split(',');
            // console.log(arr[0].trim());

            // const arr = req.query.append_to_response
            //   .split(',')
            //   .join(',-')
            //   .split(',');
            // arr[0] = '-' + arr[0];
            if (!req.query.append_to_response) {
              TVdetail.findOne({ id: req.params.slug })
                .select(['-credits', '-similar', '-recommendations'])
                .then((dataMovies) => {
                  // dataMovies == null
                  //   ? res.status(400).json(errorMsg.errDefault)
                  //   :
                  res.json(mongooseToObject(dataMovies));
                })
                .catch((error) => {
                  res.status(400).json(errorMsg.errDefault);
                  next(error);
                });
            } else {
              TVdetail.findOne({ id: req.params.slug })
                .select(['-credits', '-similar', '-recommendations'])
                .then((dataMovies) => {
                  // dataMovies == null
                  //   ? res.status(404).json(errorMsg.errDefault)
                  //   :
                  TVdetail.findOne({ id: req.params.slug })
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

  async season(req, res, next) {
    try {
      if (req.query.api == API_KEY) {
        // TVdetail.findOne({
        //   id: req.params.movieid,
        // })
        //   .then((dataMovies) => {
        //     res.json(mongooseToObject(dataMovies));
        //   })
        //   .catch((error) => {
        //     res.status(400).json(errorMsg.errDefault);
        //     next(error);
        //   });
        var doc = await TVdetail.findOne(
          { id: req.params.movieid },
          {
            seasons: {
              $elemMatch: { season_number: +req.params.seasonnumber },
            },
          }
        ).catch((error) => {
          res.status(400).json(errorMsg.errDefault);
          next(error);
        });

        Season.findOne({
          id: doc.seasons[0].id,
        })
          .then((seasonRes) => {
            res.json(mongooseToObject(seasonRes));
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

  async update(req, res, next) {
    try {
      if (req.query.api == API_KEY) {
        switch (req.params.slug1) {
          case 'rating':
            let doc = await TVdetail.findOne({
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

module.exports = new TVController();
