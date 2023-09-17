import express from 'express';
import SortOption from '@/controllers/sortbyController';

const router = express.Router();

router.get('/:slug', SortOption.get);

export default router;
