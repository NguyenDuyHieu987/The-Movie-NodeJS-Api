import express from 'express';

import Year from '@/controllers/yearController';

const router = express.Router();

router.get('/get-all', Year.getAll);

export default router;
