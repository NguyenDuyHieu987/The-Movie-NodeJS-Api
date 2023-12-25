import SortOption from '@/controllers/sortbyController';
import express from 'express';

const router = express.Router();

router.get('/:slug', SortOption.get);

export default router;
