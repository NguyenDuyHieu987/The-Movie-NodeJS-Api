import express from 'express';

import Movie from '@/controllers/movie.controller';
import MovieSlug from '@/controllers/movieSlug.controller';
import { authenticationHandler } from '@/middlewares';

const router = express.Router();

router.get('/get-all', Movie.getAll);
router.get('/search', Movie.search);
router.get('/detail/:type/:id', Movie.get);
router.post(
  '/update-view/:id',
  (...params) => authenticationHandler(...params, { required: true }),
  Movie.updateView
);
router.get('/:slug', MovieSlug.getSlug);
router.get('/discover/:slug', MovieSlug.filter);
router.post('/create', Movie.create);
router.post('/update/:id', Movie.updateVideo);
router.post('/update-videopath/:id', Movie.updateVideoPath);
router.delete('/delete/:id', Movie.deleteVideo);

export default router;
