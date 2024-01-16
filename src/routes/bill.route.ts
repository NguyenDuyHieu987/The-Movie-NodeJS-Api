import express from 'express';

import Bill from '@/controllers/bill.controller';
const router = express.Router();

router.get('/get-all', Bill.getAll);

export default router;
