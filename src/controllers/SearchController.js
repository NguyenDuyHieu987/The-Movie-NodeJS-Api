import MovieDetail from '../models/movie';
import TVdetail from '../models/tv';
import errorMsg from '../utils/errorMsg';
import { mongooseToObject } from '../utils/mongoose';
import { multipleMongooseToObject } from '../utils/mongoose';

class SearchController {
  index(req, res, next) {
    try {
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
    } catch (error) {
      res.status(400).json(errorMsg.errDefault);
    } finally {
    }
  }
}

export default new SearchController();
