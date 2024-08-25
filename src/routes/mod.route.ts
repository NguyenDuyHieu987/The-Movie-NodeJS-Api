import express from 'express';

import Mod from '@/controllers/mod.controller';
const router = express.Router();

router.get('/get-all', Mod.getAll);

export default router;
