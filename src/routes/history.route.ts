import express from 'express';

import History from '@/controllers/history.controller';
import { authenticationHandler } from '@/middlewares';

const router = express.Router();

router.get(
  '/get-all/:slug',
  (...params) => authenticationHandler(...params, { required: true }),
  History.getAll
);
router.get(
  '/search/:slug',
  (...params) => authenticationHandler(...params, { required: true }),
  History.search
);
router.get(
  '/get/:type/:movieId',
  (...params) => authenticationHandler(...params, { required: true }),
  History.get
);
router.post(
  '/add',
  (...params) => authenticationHandler(...params, { required: true }),
  History.add
);
router.delete(
  '/remove',
  (...params) => authenticationHandler(...params, { required: true }),
  History.remove
);
router.delete(
  '/clear',
  (...params) => authenticationHandler(...params, { required: true }),
  History.clear
);

export default router;
