import express from 'express';

import List from '@/controllers/list.controller';
import { authenticationHandler } from '@/middlewares';

const router = express.Router();

router.get(
  '/get-all/:slug',
  (...params) => authenticationHandler(...params, { required: true }),
  List.getAll
);
router.get(
  '/search/:slug',
  (...params) => authenticationHandler(...params, { required: true }),
  List.search
);
router.get(
  '/get/:type/:movieId',
  (...params) => authenticationHandler(...params, { required: true }),
  List.get
);
router.post(
  '/add',
  (...params) => authenticationHandler(...params, { required: true }),
  List.add
);
router.delete(
  '/remove',
  (...params) => authenticationHandler(...params, { required: true }),
  List.remove
);
router.delete(
  '/clear',
  (...params) => authenticationHandler(...params, { required: true }),
  List.clear
);

export default router;
