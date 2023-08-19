import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import Movie from '@/models/movie';
import TV from '@/models/tv';

class SearchController {
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const query: string = (req.query.query as string) || '';
      const page: number = +req.query?.page! - 1 || 0;

      switch (req.params.type) {
        case 'all':
          const data = await Movie.find({
            $or: [
              { name: { $regex: query, $options: 'i' } },
              { original_name: { $regex: query, $options: 'i' } },
            ],
          })
            .populate('tvs')
            .skip(page * 10)
            .limit(10);

          res.json({
            results: data,
            movie: [],
            tv: [],
            total: data.length,
            total_movie: 0,
            total_tv: 0,
            page_size: 20,
          });

          break;
        case 'movie':
          Movie.find({
            $or: [
              { name: { $regex: query, $options: 'i' } },
              { original_name: { $regex: query, $options: 'i' } },
            ],
          })
            .skip(page * 20)
            .limit(20);

          break;
        case 'tv':
          TV.find({
            $or: [
              { name: { $regex: query, $options: 'i' } },
              { original_name: { $regex: query, $options: 'i' } },
            ],
          })
            .skip(page * 20)
            .limit(20);

          break;
        default:
          next(
            createHttpError.NotFound(
              `Search with type: ${req.params.type} is not found!`
            )
          );
          break;
      }
    } catch (error) {
      next(error);
    }
  }
}

export default new SearchController();
