import express from 'express';

import Broadcast from '@/controllers/broadcast.controller';
import { authenticationHandler } from '@/middlewares';

const router = express.Router();

router.get('/get-all', Broadcast.getAll);
router.get('/search', Broadcast.search);
router.get('/get-allairing', Broadcast.getAllAiring);
router.get('/detail/:id', Broadcast.detail);
router.post(
  '/interact/:id',
  (...params) => authenticationHandler(...params, { required: true }),
  Broadcast.Interact
);
router.post(
  '/create',
  (...params) =>
    authenticationHandler(...params, { required: true, role: ['admin'] }),
  Broadcast.create
);
router.post(
  '/update/:id',
  (...params) =>
    authenticationHandler(...params, { required: true, role: ['admin'] }),
  Broadcast.updateBroadcast
);
router.delete(
  '/delete/:id',
  (...params) =>
    authenticationHandler(...params, { required: true, role: ['admin'] }),
  Broadcast.deleteBroadcast
);
router.delete(
  '/delete-multiple',
  (...params) =>
    authenticationHandler(...params, { required: true, role: ['admin'] }),
  Broadcast.deleteBroadcastMultiple
);

export default router;
