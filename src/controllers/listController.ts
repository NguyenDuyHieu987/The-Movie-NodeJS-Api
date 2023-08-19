import type { NextFunction, Request, Response } from 'express';
import List from '@/models/list';
import MovieDetail from '@/models/movie';
import TVDetail from '@/models/tv';
import errorMsg from '@/utils/errorMsg';
import { mongooseToObject } from '@/utils/mongoose';

class ListController {
  // GET /

  async get(req: Request, res: Response, next: NextFunction) {
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

  addItem(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.body.media_type === 'movie') {
        MovieDetail.findOne({
          id: req.body.media_id,
        })
          .then((dataMovies) => {
            // res.json(mongooseToObject(listResponse));
            // const itemList = new ItemList({
            //   ...mongooseToObject(dataMovies),
            //   media_type: 'movie',
            // });
            // itemList.save();
            // console.log(itemList);
            // res.json(mongooseToObject(dataMovies));

            List.findOneAndUpdate(
              { id: req.params.slug },
              { $addToSet: { items: {} } },
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

            // const itemList = new ItemList({
            //   ...mongooseToObject(dataTV),
            //   media_type: 'tv',
            // });
            // itemList.save();
            // console.log(itemList);
            // res.json(mongooseToObject(dataMovies));

            List.findOneAndUpdate(
              { id: req.params.slug },
              { $addToSet: { items: {} } },
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

  removeItem(req: Request, res: Response, next: NextFunction) {
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

  newList(req: Request, res: Response, next: NextFunction) {
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
