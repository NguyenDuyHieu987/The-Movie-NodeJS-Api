import type { Application, NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import accountRouter from './account';
import authRouter from './auth';
import commentRouter from './comment';
import countryRouter from './country';
import creditRouter from './credit';
import discoverRouter from './discover';
import episodeRouter from './episode';
import genreRouter from './genre';
import historyRouter from './history';
import imageRouter from './image';
import listRouter from './list';
import movieRouter from './movie';
import notificationRouter from './notification';
import planRouter from './plan';
import ranRouter from './rank';
import ratingRouter from './rating';
import recommendRouter from './recommend';
import searchRouter from './search';
import seasonRouter from './season';
import similarRouter from './similar';
import sortOptionRouter from './sortby';
import trendingRouter from './trending';
import tvRouter from './tv';
import updateViewRouter from './updateView';
import videoRouter from './video';
import yearRouter from './year';

import ErrorHandler from '@/controllers/errorController';

export default function route(app: Application) {
  app.use('/auth', authRouter);
  app.use('/account', accountRouter);
  app.use('/movie', movieRouter);
  app.use('/tv', tvRouter);
  app.use('/season', seasonRouter);
  app.use('/episode', episodeRouter);
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
  app.use('/recommend', recommendRouter);
  app.use('/plan', planRouter);
  app.use('/rating', ratingRouter);
  app.use('/comment', commentRouter);
  app.use('/ranks', ranRouter);
  app.use('/update-view', updateViewRouter);
  app.use('/notification', notificationRouter);
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
