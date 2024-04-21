import express from 'express';

import TV from '@/controllers/tv.controller';
import TvSlug from '@/controllers/tvSlug.controller';
import { authenticationHandler } from '@/middlewares';

const router = express.Router();

router.get('/detail/:id', TV.get);
router.post(
  '/update-view/:id',
  (...params) => authenticationHandler(...params, { required: true }),
  TV.updateView
);
router.get('/:slug', TvSlug.getSlug);
router.get('/discover/:slug', TvSlug.filter);

export default router;
