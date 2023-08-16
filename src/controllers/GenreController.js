import Genre from '../models/Genre';
import errorMsg from '../utils/errorMsg';
import { mongooseToObject } from '../utils/mongoose';
import { multipleMongooseToObject } from '../utils/mongoose';

class GenreController {
  // GET /
  index(req, res, next) {
    try {
      switch (req.params.slug) {
        case 'all':
          Genre.find({})
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
    } catch (error) {
      res.status(400).json(errorMsg.errDefault);
    } finally {
    }
  }
}

export default new GenreController();