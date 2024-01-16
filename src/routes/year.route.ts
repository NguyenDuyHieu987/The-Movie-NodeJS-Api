import express from 'express';

import Year from '@/controllers/year.controller';

const router = express.Router();

router.get('/get-all', Year.getAll);

export default router;
