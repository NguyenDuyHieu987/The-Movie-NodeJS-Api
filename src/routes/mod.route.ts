import express from 'express';

import Mod from '@/controllers/mod.controller';
const router = express.Router();

router.get('/get-all', Mod.getAll);
router.get('/get-all-with-data', Mod.getAllWithData);
router.get('/filter-with-data/:type', Mod.filteWithData);

export default router;
