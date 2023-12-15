import express from 'express';
import Rank from '@/controllers/ranksController';

const router = express.Router();

router.get('/:slug', Rank.get);

export default router;
