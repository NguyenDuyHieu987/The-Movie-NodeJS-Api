import express from 'express';

import Credit from '@/controllers/credit.controller';
const router = express.Router();

router.get('/:id', Credit.get);

export default router;
