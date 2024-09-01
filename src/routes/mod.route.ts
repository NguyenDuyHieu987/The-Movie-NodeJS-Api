import express from 'express';

import Mod from '@/controllers/mod.controller';
const router = express.Router();

router.get('/get-all', Mod.getAll);
router.get('/filter/:type/:slug', Mod.filter);

export default router;
