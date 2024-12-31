import express from 'express';

import Country from '@/controllers/country.controller';
import { authenticationHandler } from '@/middlewares';
const router = express.Router();

router.get('/get-all', Country.getAll);
router.get('/search', Country.search);
router.post(
  '/create',
  (...params) =>
    authenticationHandler(...params, { required: true, role: ['admin'] }),
  Country.create
);
router.post(
  '/update/:id',
  (...params) =>
    authenticationHandler(...params, { required: true, role: ['admin'] }),
  Country.updateCountry
);
router.delete(
  '/delete/:id',
  (...params) =>
    authenticationHandler(...params, { required: true, role: ['admin'] }),
  Country.deleteCountry
);
router.delete(
  '/delete-multiple',
  (...params) =>
    authenticationHandler(...params, { required: true, role: ['admin'] }),
  Country.deleteCountryMultiple
);

export default router;
