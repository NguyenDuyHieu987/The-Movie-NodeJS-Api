import express from 'express';

import ModList from '@/controllers/modList.controller';
import { authenticationHandler } from '@/middlewares';
const router = express.Router();

router.get('/get-all', ModList.getAll);
router.get('/search', ModList.search);
router.get('/filter/:type/:slug', ModList.filter);
router.post(
  '/create',
  (...params) =>
    authenticationHandler(...params, { required: true, role: ['admin'] }),
  ModList.create
);
router.post(
  '/update/:id',
  (...params) =>
    authenticationHandler(...params, { required: true, role: ['admin'] }),
  ModList.updateModList
);
router.delete(
  '/delete/:id',
  (...params) =>
    authenticationHandler(...params, { required: true, role: ['admin'] }),
  ModList.deleteModList
);
router.delete(
  '/delete-multiple',
  (...params) =>
    authenticationHandler(...params, { required: true, role: ['admin'] }),
  ModList.deleteModListMultiple
);

export default router;
