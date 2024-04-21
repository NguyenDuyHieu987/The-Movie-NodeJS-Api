import express from 'express';

import Invoice from '@/controllers/invoice.controller';
import { authenticationHandler } from '@/middlewares';

const router = express.Router();

router.get(
  '/get-all',
  (...params) => authenticationHandler(...params, { required: true }),
  Invoice.getAll
);
router.get(
  '/get/:id',
  (...params) => authenticationHandler(...params, { required: true }),
  Invoice.get
);

export default router;
