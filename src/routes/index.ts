import type { Application, NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import movieRouter from './movie';
import trendingRouter from './trending';
import tvRouter from './tv';
import searchRouter from './search';
import discoverRouter from './discover';
import genreRouter from './genre';
import countryRouter from './country';
import yearRouter from './year';
import sortOptionRouter from './sortby';
import listRouter from './list';
import historyRouter from './history';
import authRouter from './auth';
import creditRouter from './credit';
import videoRouter from './video';
import imageRouter from './image';
import similarRouter from './similar';
import planRouter from './plan';
import ratingRouter from './rating';
import commentRouter from './comment';
import rankingRouter from './ranking';
import ErrorHandler from '@/controllers/errorController';

export default function route(app: Application) {
  app.use('/auth', authRouter);
  app.use('/movie', movieRouter);
  app.use('/tv', tvRouter);
  app.use('/search', searchRouter);
  app.use('/discover', discoverRouter);
  app.use('/trending', trendingRouter);
  app.use('/genre', genreRouter);
  app.use('/country', countryRouter);
  app.use('/year', yearRouter);
  app.use('/sortby', sortOptionRouter);
  app.use('/list', listRouter);
  app.use('/history', historyRouter);
  app.use('/credits', creditRouter);
  app.use('/videos', videoRouter);
  app.use('/images', imageRouter);
  app.use('/similar', similarRouter);
  app.use('/plan', planRouter);
  app.use('/rating', ratingRouter);
  app.use('/comment', commentRouter);
  app.use('/ranking', rankingRouter);
  app.all('*', (req: Request, res: Response, next: NextFunction) => {
    return next(
      createHttpError(
        404,
        `Can't find the route: ${req.originalUrl} on server!`
      )
    );
  });
  app.use(ErrorHandler);
}
