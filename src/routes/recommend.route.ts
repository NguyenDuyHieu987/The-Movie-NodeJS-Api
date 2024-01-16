import express from 'express';

import Recommend from '@/controllers/recommend.controller';
import { authenticationHandler } from '@/middlewares';

const router = express.Router();

router.get(
  '/get-all',
  (...params) => authenticationHandler(...params, { required: true }),
  Recommend.getAll
);

export default router;
