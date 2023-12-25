import express from 'express';

import Bill from '@/controllers/billController';
const router = express.Router();

router.get('/get', Bill.get);

export default router;
