import Country from '../models/Country';
import errorMsg from '../utils/errorMsg';
import { mongooseToObject } from '../utils/mongoose';
import { multipleMongooseToObject } from '../utils/mongoose';

class CountryController {
  // GET /
  index(req, res, next) {
    try {
      switch (req.params.slug) {
        case 'all':
          Country.find({})
            .then((countryResponse) => {
              res.json(multipleMongooseToObject(countryResponse));
            })
            .catch((error) => {
              res.status(400).json(errorMsg.errDefault);
              next(error);
            });
          break;
        default:
          Country.findOne({ name2: req.params.slug })
            .then((countryResponse) => {
              res.json(mongooseToObject(countryResponse));
            })
            .catch((error) => {
              res.status(400).json(errorMsg.errDefault);
              next(error);
            });
          break;
      }
    } catch (error) {
      res.status(400).json(errorMsg.errDefault);
    } finally {
    }
  }
}

export default new CountryController();
