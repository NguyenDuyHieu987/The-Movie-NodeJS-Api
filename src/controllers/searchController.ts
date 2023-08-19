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
          const movie = await Movie.find({
            $or: [
              { name: { $regex: query, $options: 'i' } },
              { original_name: { $regex: query, $options: 'i' } },
            ],
          })
            .skip(page * 10)
            .limit(10)
            .sort({ views: -1 });

          const tv = await TV.find({
            $or: [
              { name: { $regex: query, $options: 'i' } },
              { original_name: { $regex: query, $options: 'i' } },
            ],
          })
            .skip(page * 10)
            .limit(10)
            .sort({ views: -1 });

          const result = movie.concat(tv);

          res.json({
            page: page + 1,
            results: result,
            movie: movie,
            tv: tv,
            total: result.length,
            total_movie: movie.length,
            total_tv: tv.length,
            page_size: 20,
          });

          break;
        case 'movie':
          const movies = await Movie.find({
            $or: [
              { name: { $regex: query, $options: 'i' } },
              { original_name: { $regex: query, $options: 'i' } },
            ],
          })
            .skip(page * 20)
            .limit(20)
            .sort({ views: -1 });

          res.json({
            page: page + 1,
            results: movies,
            total: movies.length,
            page_size: 20,
          });

          break;
        case 'tv':
          const tvs = await TV.find({
            $or: [
              { name: { $regex: query, $options: 'i' } },
              { original_name: { $regex: query, $options: 'i' } },
            ],
          })
            .skip(page * 20)
            .limit(20)
            .sort({ views: -1 });

          res.json({
            page: page + 1,
            results: tvs,
            total: tvs.length,
            page_size: 20,
          });

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
