import express from 'express';

import Recommend from '@/controllers/recommendController';

const router = express.Router();

router.get('/get', Recommend.get);

export default router;
