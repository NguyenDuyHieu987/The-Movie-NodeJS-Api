import express from 'express';

import ModList from '@/controllers/modList.controller';
const router = express.Router();

router.get('/filter/:type/:slug', ModList.filter);

export default router;
