import express from 'express';

import Rate from '@/controllers/rating.controller';
import { authenticationHandler } from '@/middlewares';

const router = express.Router();

router.get(
  '/get/:movieType/:movieId',
  (...params) => authenticationHandler(...params, { required: true }),
  Rate.get
);
router.post(
  '/:movieType/:movieId',
  (...params) => authenticationHandler(...params, { required: true }),
  Rate.rate
);

export default router;
