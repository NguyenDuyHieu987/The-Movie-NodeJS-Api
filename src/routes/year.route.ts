import express from 'express';

import Year from '@/controllers/year.controller';
import { authenticationHandler } from '@/middlewares';

const router = express.Router();

router.get('/get-all', Year.getAll);
router.get('/search', Year.search);
router.post(
  '/create',
  (...params) =>
    authenticationHandler(...params, { required: true, role: ['admin'] }),
  Year.create
);
router.post(
  '/update/:id',
  (...params) =>
    authenticationHandler(...params, { required: true, role: ['admin'] }),
  Year.updateYear
);
router.delete(
  '/delete/:id',
  (...params) =>
    authenticationHandler(...params, { required: true, role: ['admin'] }),
  Year.deleteYear
);
router.delete(
  '/delete-multiple',
  (...params) =>
    authenticationHandler(...params, { required: true, role: ['admin'] }),
  Year.deleteYearMultiple
);

export default router;
