import express from 'express';

import Recommend from '@/controllers/recommendController';

const router = express.Router();

router.get('/get-all', Recommend.getAll);

export default router;
