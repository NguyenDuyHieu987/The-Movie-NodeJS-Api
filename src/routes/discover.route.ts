import express from 'express';

import Discover from '@/controllers/discover.controller';
const router = express.Router();

router.get('/:slug', Discover.getSlug);

export default router;
