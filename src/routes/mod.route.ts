import express from 'express';

import Mod from '@/controllers/mod.controller';
import { authenticationHandler } from '@/middlewares';
const router = express.Router();

router.get('/get-all', Mod.getAll);
router.get('/search', Mod.search);
router.get('/get-all-with-data', Mod.getAllWithData);
router.get('/filter-with-data/:type', Mod.filterWithData);
router.post(
  '/create',
  (...params) =>
    authenticationHandler(...params, { required: true, role: ['admin'] }),
  Mod.create
);
router.post(
  '/update/:id',
  (...params) =>
    authenticationHandler(...params, { required: true, role: ['admin'] }),
  Mod.updateMod
);
router.delete(
  '/delete/:id',
  (...params) =>
    authenticationHandler(...params, { required: true, role: ['admin'] }),
  Mod.deleteMod
);
router.delete(
  '/delete-multiple',
  (...params) =>
    authenticationHandler(...params, { required: true, role: ['admin'] }),
  Mod.deleteModMultiple
);

export default router;
