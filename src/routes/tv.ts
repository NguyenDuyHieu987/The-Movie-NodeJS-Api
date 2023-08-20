import express from 'express';
import TV from '@/controllers/tvController';
import TvSlug from '@/controllers/tvSlugController';
import TvSeason from '@/controllers/seasonController';

const router = express.Router();

router.get('/detail/:id', TV.get);
router.get('/:slug', TvSlug.get);
router.get('/:movieId/season/:seasonNumber', TvSeason.get);

export default router;
