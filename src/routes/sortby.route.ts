import express from 'express';

import SortOption from '@/controllers/sortby.controller';

const router = express.Router();

router.get('/get-all', SortOption.getAll);

export default router;
