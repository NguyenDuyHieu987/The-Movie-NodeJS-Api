import type { Application, NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import accountRouter from './account.route';
import modRouter from './mod.route';
import modListRouter from './modList.route';
import authRouter from './authentication.route';
import billRouter from './bill.route';
import commentRouter from './comment.route';
import countryRouter from './country.route';
import creditRouter from './credit.route';
import discoverRouter from './discover.route';
import episodeRouter from './episode.route';
import genreRouter from './genre.route';
import historyRouter from './history.route';
import imageRouter from './image.route';
import invoiceRouter from './invoice.route';
import listRouter from './list.route';
import movieRouter from './movie.route';
import notificationRouter from './notification.route';
import planRouter from './plan.route';
import ranRouter from './rank.route';
import ratingRouter from './rating.route';
import recommendRouter from './recommend.route';
import broadcastRouter from './broadcast.route';
import searchRouter from './search.route';
import seasonRouter from './season.route';
import similarRouter from './similar.route';
import sortOptionRouter from './sortby.route';
import subscriptionRouter from './subscription.route';
import videoRouter from './video.route';
import yearRouter from './year.route';

export default function route(app: Application) {
  app.use('/auth', authRouter);
  app.use('/account', accountRouter);
  app.use('/mod', modRouter);
  app.use('/modlist', modListRouter);
  app.use('/movie', movieRouter);
  app.use('/season', seasonRouter);
  app.use('/episode', episodeRouter);
  app.use('/search', searchRouter);
  app.use('/discover', discoverRouter);
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
  app.use('/broadcast', broadcastRouter);
  app.use('/plan', planRouter);
  app.use('/rating', ratingRouter);
  app.use('/comment', commentRouter);
  app.use('/bill', billRouter);
  app.use('/invoice', invoiceRouter);
  app.use('/subscription', subscriptionRouter);
  app.use('/ranks', ranRouter);
  app.use('/notification', notificationRouter);
  app.all('*', (req: Request, res: Response, next: NextFunction) => {
    return next(
      createHttpError(
        404,
        `Can't find the route: ${req.originalUrl} on server!`
      )
    );
  });
}
