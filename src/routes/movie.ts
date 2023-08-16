import express from 'express';
import movieController from '../controllers/MovieController';

const router = express.Router();

// router.get('/search', siteController.search);
router.get('/:slug', movieController.index);
router.post('/:movieid/:slug1', movieController.update);

export default router;
