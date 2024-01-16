import express from 'express';

import Invoice from '@/controllers/invoice.controller';
const router = express.Router();

router.get('/get-all', Invoice.getAll);

export default router;
