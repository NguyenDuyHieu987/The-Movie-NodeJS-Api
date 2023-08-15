const Year = require('../models/Year');
const config = require('../../../package.json');
const API_KEY = config.projectConfig.apiKey;
const errorMsg = require('../../until/errorMsg');

const { multipleMongooseToObject } = require('../../until/mongoose');
const { mongooseToObject } = require('../../until/mongoose');

class YearController {
  // GET /
  index(req, res, next) {
    try {
      if (req.query.api == API_KEY) {
        switch (req.params.slug) {
          case 'all':
            Year.find({})
              .then((genreResponse) => {
                res.json(multipleMongooseToObject(genreResponse));
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

module.exports = new YearController();
