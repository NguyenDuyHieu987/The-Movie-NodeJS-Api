const DataMovies = require('../models/DataMovies');
const config = require('../../../package.json');
const errorMsg = require('../../until/errorMsg');

const { multipleMongooseToObject } = require('../../until/mongoose');
const { mongooseToObject } = require('../../until/mongoose');

class TrendingController {
  index(req, res, next) {
    try {
      switch (req.params.slug) {
        case 'all':
          DataMovies.Trending.findOne({
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
          res.status(400).json(errorMsg.errDefault);
          break;
      }
    } catch (error) {
      res.status(400).json(errorMsg.errDefault);
    } finally {
    }
  }
}

module.exports = new TrendingController();
