const errorMsg = require('./errorMsg');
const { multipleMongooseToObject } = require('./mongoose');
const { mongooseToObject } = require('./mongoose');
const MovieDetail = require('../app/models/Movie');
const TVdetail = require('../app/models/TV');

module.exports = {
  getAll: function (
    paramsMongooseMovie,
    paramsMongooseTV,
    paramsSortMovie,
    paramsSortTV,
    res,
    req
  ) {
    MovieDetail.find(paramsMongooseMovie)
      .sort(paramsSortMovie)
      .skip((req.query.page - 1) * 10)
      .limit(10)
      .then((dataMovies) => {
        // res.json(multipleMongooseToObject(dataMovies));
        TVdetail.find(paramsMongooseTV)
          .sort(paramsSortTV)
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
  },
  getMovie: function (paramsMongoose, paramsSortMovie, res, req) {
    MovieDetail.find(paramsMongoose)
      .sort(paramsSortMovie)
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
  },
  getTV: function (paramsMongoose, paramsSortTV, res, req) {
    TVdetail.find(paramsMongoose)
      .sort(paramsSortTV)
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
  },
};
