import express from 'express';

import Broadcast from '@/controllers/broadcast.controller';

const router = express.Router();

router.get('/get-all', Broadcast.getAll);
router.get('/detail/:id', Broadcast.detail);

export default router;
