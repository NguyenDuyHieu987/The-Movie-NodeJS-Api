import express from 'express';
import Movie from '@/controllers/movieSlugController';
import MovieSlug from '@/controllers/movieSlugController';

const router = express.Router();

router.get('/:slug', MovieSlug.get);
router.get('/detail/:id', Movie.get);

export default router;
