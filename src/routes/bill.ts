import Bill from '@/controllers/billController';
import express from 'express';
const router = express.Router();

router.get('/get', Bill.get);

export default router;
