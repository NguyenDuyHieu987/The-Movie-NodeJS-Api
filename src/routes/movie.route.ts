import express from 'express';

import Movie from '@/controllers/movie.controller';
import MovieSlug from '@/controllers/movieSlug.controller';
import { authenticationHandler } from '@/middlewares';

const router = express.Router();

router.get('/get-all', Movie.getAll);
router.get('/search', Movie.search);
router.get('/detail/:type/:id', Movie.detail);
router.post(
  '/update-view/:id',
  (...params) => authenticationHandler(...params, { required: true }),
  Movie.updateView
);
router.get('/:slug', MovieSlug.getSlug);
router.get('/discover/:slug', MovieSlug.filter);
router.post(
  '/create',
  (...params) =>
    authenticationHandler(...params, { required: true, role: ['admin'] }),
  Movie.create
);
router.post(
  '/update/:id',
  (...params) =>
    authenticationHandler(...params, { required: true, role: ['admin'] }),
  Movie.updateMovie
);
router.post(
  '/update-videoupload/:id',
  (...params) =>
    authenticationHandler(...params, { required: true, role: ['admin'] }),
  Movie.updateVideoUpload
);
router.delete(
  '/delete/:id',
  (...params) =>
    authenticationHandler(...params, { required: true, role: ['admin'] }),
  Movie.deleteMovie
);
router.delete(
  '/delete-multiple',
  (...params) =>
    authenticationHandler(...params, { required: true, role: ['admin'] }),
  Movie.deleteMovieMultiple
);

export default router;
