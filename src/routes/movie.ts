import Movie from '@/controllers/movieController';
import MovieSlug from '@/controllers/movieSlugController';
import express from 'express';

const router = express.Router();

router.get('/detail/:id', Movie.get);
router.get('/:slug', MovieSlug.get);
router.get('/discover/:slug', MovieSlug.filter);

export default router;
