import Similar from '@/controllers/similarController';
import express from 'express';

const router = express.Router();

router.get('/:type/:movieId', Similar.get);

export default router;
