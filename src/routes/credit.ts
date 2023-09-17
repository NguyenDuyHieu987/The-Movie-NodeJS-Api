import express from 'express';
import Credit from '@/controllers/creditController';
const router = express.Router();

router.get('/:id', Credit.get);

export default router;
