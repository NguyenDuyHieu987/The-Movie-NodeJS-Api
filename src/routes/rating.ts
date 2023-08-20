import express from 'express';
import Rate from '@/controllers/ratingController';
const router = express.Router();

router.get('/get/:type/:movieId', Rate.get);
router.post('/:type/:movieId', Rate.rate);

export default router;
