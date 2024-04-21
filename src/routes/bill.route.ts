import express from 'express';

import Bill from '@/controllers/bill.controller';
import { authenticationHandler } from '@/middlewares';

const router = express.Router();

router.get(
  '/get-all',
  (...params) => authenticationHandler(...params, { required: true }),
  Bill.getAll
);
router.get(
  '/get/:id',
  (...params) => authenticationHandler(...params, { required: true }),
  Bill.get
);

export default router;
