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
import listRouter from './list';
import watchlistRouter from './watchlist';
import athRouter from './auth';
import ErrorHandler from '../controllers/errorController';

export default function route(app: Application) {
  app.use('/movie', movieRouter);
  app.use('/tv', tvRouter);
  app.use('/search', searchRouter);
  app.use('/discover', discoverRouter);
  app.use('/trending', trendingRouter);
  app.use('/genre', genreRouter);
  app.use('/country', countryRouter);
  app.use('/year', yearRouter);
  app.use('/list', listRouter);
  app.use('/watchlist', watchlistRouter);
  app.use('/auth', athRouter);
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
