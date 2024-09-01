import express from 'express';

import Mod from '@/controllers/mod.controller';
const router = express.Router();

router.get('/get-all', Mod.getAll);
router.get('/get-all-with-data', Mod.getAllWithData);

export default router;
