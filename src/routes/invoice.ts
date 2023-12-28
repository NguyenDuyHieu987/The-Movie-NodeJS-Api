import express from 'express';

import Invoice from '@/controllers/invoiceController';
const router = express.Router();

router.get('/get-all', Invoice.getAll);

export default router;
