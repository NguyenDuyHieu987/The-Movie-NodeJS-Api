import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import MovieSlug from '@/models/movieSlug';
import Movie from '@/models/movie';

class MovieSlugController {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const page: number = +req.query?.page! - 1 || 0;

      switch (req.params.slug) {
        case 'all':
          const data = await Movie.find()
            .skip(page * 20)
            .limit(20);

          const total = await Movie.countDocuments({});

          res.json({
            page: page + 1,
            results: data,
            total: total,
            page_size: 20,
          });
          break;
        case 'nowplaying':
          const nowplaying = await MovieSlug.NowPlaying.find()
            .skip(page * 20)
            .limit(20);

          const totalNowPlaying = await MovieSlug.NowPlaying.countDocuments({});

          res.json({
            page: page + 1,
            results: nowplaying,
            total: totalNowPlaying,
            page_size: 20,
          });
          break;
        case 'upcoming':
          const upcoming = await MovieSlug.UpComing.find()
            .skip(page * 20)
            .limit(20);

          const totalUpComing = await MovieSlug.UpComing.countDocuments({});

          res.json({
            page: page + 1,
            results: upcoming,
            total: totalUpComing,
            page_size: 20,
          });
          break;
        case 'popular':
          const popular = await MovieSlug.Popular.find()
            .skip(page * 20)
            .limit(20);

          const totalPopular = await MovieSlug.Popular.countDocuments({});

          res.json({
            page: page + 1,
            results: popular,
            total: totalPopular,
            page_size: 20,
          });
          break;
        case 'toprated':
          const toprated = await MovieSlug.TopRated.find()
            .skip(page * 20)
            .limit(20);

          const totalTopRated = await MovieSlug.TopRated.countDocuments({});

          res.json({
            page: page + 1,
            results: toprated,
            total: totalTopRated,
            page_size: 20,
          });
          break;
        default:
          next(
            createHttpError.NotFound(
              `Movies with slug: ${req.params.slug} is not found!`
            )
          );
          break;
      }
    } catch (error) {
      next(error);
    }
  }
}

export default new MovieSlugController();
