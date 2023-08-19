import errorMsg from '../utils/errorMsg';
import { mongooseToObject } from '../utils/mongoose';
import { multipleMongooseToObject } from '../utils/mongoose';
import MovieDetail from '../models/movie';
import TVdetail from '../models/tv';

export function getAll(
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
}

export function getMovie(paramsMongoose, paramsSortMovie, res, req) {
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
}
export function getTV(paramsMongoose, paramsSortTV, res, req) {
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
}
