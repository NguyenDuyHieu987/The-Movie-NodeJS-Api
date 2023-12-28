import express from 'express';

import SortOption from '@/controllers/sortbyController';

const router = express.Router();

router.get('/get-all', SortOption.getAll);

export default router;
