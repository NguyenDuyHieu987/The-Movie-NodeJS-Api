import List from '../models/List';
import MovieDetail from '../models/Movie';
import TVDetail from '../models/TV';
import config from '../../package.json';
import errorMsg from '../utils/errorMsg';
import { ItemList } from '../models/ItemList';

import { mongooseToObject } from '../utils/mongoose';
import { multipleMongooseToObject } from '../utils/mongoose';

class ListController {
  // GET /

  index(req, res, next) {
    try {
      List.findOne({ id: req.params.slug })
        .then((listResponse) => {
          res.json(mongooseToObject(listResponse));
        })
        .catch((error) => {
          res.status(400).json(errorMsg.errDefault);
          next(error);
        });
    } catch (error) {
      res.status(400).json(errorMsg.errDefault);
    } finally {
    }
  }

  addItem(req, res, next) {
    try {
      if (req.body.media_type === 'movie') {
        MovieDetail.findOne({
          id: req.body.media_id,
        })
          .then((dataMovies) => {
            // res.json(mongooseToObject(listResponse));
            const itemList = new ItemList({
              ...mongooseToObject(dataMovies),
              media_type: 'movie',
            });
            // itemList.save();
            // console.log(itemList);
            // res.json(mongooseToObject(dataMovies));

            List.findOneAndUpdate(
              { id: req.params.slug },
              { $addToSet: { items: itemList } },
              { new: true },
              (err, doc) => {
                if (err) {
                  console.log('Something wrong when updating data!');
                }
              }
            );
          })
          .catch((error) => {
            res.status(400).json(errorMsg.errDefault);
            next(error);
          });
      } else if (req.body.media_type === 'tv') {
        TVDetail.findOne({
          id: req.body.media_id,
        })
          .then((dataTV) => {
            // res.json(mongooseToObject(listResponse));

            const itemList = new ItemList({
              ...mongooseToObject(dataTV),
              media_type: 'tv',
            });
            // itemList.save();
            // console.log(itemList);
            // res.json(mongooseToObject(dataMovies));

            List.findOneAndUpdate(
              { id: req.params.slug },
              { $addToSet: { items: itemList } },
              { new: true },
              (err, doc) => {
                if (err) {
                  console.log('Something wrong when updating data!');
                }
              }
            );
          })
          .catch((error) => {
            res.status(400).json(errorMsg.errDefault);
            next(error);
          });
      }
    } catch (error) {
      res.status(400).json(errorMsg.errDefault);
    } finally {
    }
  }

  removeItem(req, res, next) {
    try {
      List.findOneAndUpdate(
        { id: req.params.slug },
        { $pull: { items: { id: req.body.media_id } } },
        { new: true },
        (err, doc) => {
          if (err) {
            console.log('Something wrong when updating data!');
          }
        }
      );
    } catch (error) {
      res.status(400).json(errorMsg.errDefault);
    } finally {
    }
  }

  newList(req, res, next) {
    try {
      List.findOneAndUpdate(
        { id: req.params.slug },
        { $pull: { items: { id: req.body.media_id } } },
        { new: true },
        (err, doc) => {
          if (err) {
            console.log('Something wrong when updating data!');
          }
        }
      );
    } catch (error) {
      res.status(400).json(errorMsg.errDefault);
    } finally {
    }
  }
}

export default new ListController();
