const movieRouter = require('./movie');
const trendingRouter = require('./trending');
const tvRouter = require('./tv');
const searchRouter = require('./search');
const discoverRouter = require('./discover');
const genreRouter = require('./genre');
const countryRouter = require('./country');
const yearRouter = require('./year');
const listRouter = require('./list');
const watchlistRouter = require('./watchlist');
const athRouter = require('./auth');

function route(app) {
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
}

module.exports = route;
