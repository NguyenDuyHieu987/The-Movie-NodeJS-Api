import type { Application, NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import chalk from 'chalk';
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
  app.use((req, res, next) => {
    const start = process.hrtime();

    res.on('finish', () => {
      const diff = process.hrtime(start);
      const duration = (diff[0] * 1e3 + diff[1] / 1e6).toFixed(6) + 'ms';

      const date = new Date();
      const dateStr = date.toISOString().replace('T', ' ').replace('Z', '');

      // Màu cho status
      let statusColor = chalk.bgGreen.black;
      if (res.statusCode >= 400 && res.statusCode < 500)
        statusColor = chalk.bgYellow.black;
      if (res.statusCode >= 500) statusColor = chalk.bgRed.white;

      // Màu cho method
      let methodColor = chalk.bgBlue.white;
      if (req.method === 'GET') methodColor = chalk.bgBlue.white;
      if (req.method === 'POST') methodColor = chalk.bgCyan.black;
      if (req.method === 'PUT') methodColor = chalk.bgMagenta.white;
      if (req.method === 'DELETE') methodColor = chalk.bgRed.white;

      console.log(
        chalk.gray('[PHIMHAY247-API]'),
        chalk.white(dateStr),
        chalk.white('|'),
        statusColor(` ${res.statusCode} `),
        chalk.white('|'),
        chalk.white(''.padEnd(6)),
        duration.padEnd(18),
        chalk.white('|'),
        chalk.white(req.ip?.padEnd(15)),
        chalk.white('|'),
        methodColor(` ${req.method} `),
        chalk.white(''.padEnd(1)),
        chalk.white(`"${req.originalUrl}"`)
      );
    });

    next();
  });
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
