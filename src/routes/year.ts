import express from 'express';

import Year from '@/controllers/yearController';

const router = express.Router();

router.get('/:slug', Year.get);

export default router;
