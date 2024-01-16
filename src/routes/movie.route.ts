import express from 'express';

import Movie from '@/controllers/movie.controller';
import MovieSlug from '@/controllers/movieSlug.controller';

const router = express.Router();

router.get('/detail/:id', Movie.get);
router.get('/:slug', MovieSlug.getSlug);
router.get('/discover/:slug', MovieSlug.filter);

export default router;
