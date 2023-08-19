import express from 'express';
import Movie from '@/controllers/movieController';
import MovieSlug from '@/controllers/movieSlugController';

const router = express.Router();

router.get('/detail/:id', Movie.get);
router.get('/:slug', MovieSlug.get);

export default router;
