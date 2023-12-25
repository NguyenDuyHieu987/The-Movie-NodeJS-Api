import Discover from '@/controllers/discoverController';
import express from 'express';
const router = express.Router();

router.get('/:slug', Discover.get);

export default router;
