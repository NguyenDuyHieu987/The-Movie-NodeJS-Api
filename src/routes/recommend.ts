import Recommend from '@/controllers/recommendController';
import express from 'express';

const router = express.Router();

router.get('/get', Recommend.get);

export default router;
