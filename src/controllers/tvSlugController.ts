import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import TvSlug from '@/models/tvSlug';
import TV from '@/models/tv';

class MovieSlugController {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const page: number = +req.query?.page! - 1 || 0;

      switch (req.params.slug) {
        case 'all':
          const data = await TV.find()
            .skip(page * 20)
            .limit(20);

          const total = await TV.countDocuments({});

          res.json({
            page: page + 1,
            results: data,
            total: total,
            page_size: 20,
          });
          break;
        case 'airingtoday':
          const airingtoday = await TvSlug.AiringToday.find()
            .skip(page * 20)
            .limit(20);

          const totalAiringToday = await TvSlug.AiringToday.countDocuments({});

          res.json({
            page: page + 1,
            results: airingtoday,
            total: totalAiringToday,
            page_size: 20,
          });
          break;
        case 'ontheair':
          const ontheair = await TvSlug.OnTheAir.find()
            .skip(page * 20)
            .limit(20);

          const totalOnTheAir = await TvSlug.OnTheAir.countDocuments({});

          res.json({
            page: page + 1,
            results: ontheair,
            total: totalOnTheAir,
            page_size: 20,
          });
          break;
        case 'popular':
          const popular = await TvSlug.Popular.find()
            .skip(page * 20)
            .limit(20);

          const totalPopular = await TvSlug.Popular.countDocuments({});

          res.json({
            page: page + 1,
            results: popular,
            total: totalPopular,
            page_size: 20,
          });
          break;
        case 'toprated':
          const toprated = await TvSlug.TopRated.find()
            .skip(page * 20)
            .limit(20);

          const totalTopRated = await TvSlug.TopRated.countDocuments({});

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
              `Not found with slug: ${req.params.slug} !`
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
