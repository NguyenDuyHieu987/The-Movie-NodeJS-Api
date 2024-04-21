import express from 'express';

import Movie from '@/controllers/movie.controller';
import MovieSlug from '@/controllers/movieSlug.controller';
import { authenticationHandler } from '@/middlewares';

const router = express.Router();

router.get('/detail/:id', Movie.get);
router.post(
  '/update-view/:id',
  (...params) => authenticationHandler(...params, { required: true }),
  Movie.updateView
);
router.get('/:slug', MovieSlug.getSlug);
router.get('/discover/:slug', MovieSlug.filter);

export default router;
