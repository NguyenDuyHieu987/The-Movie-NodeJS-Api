import express from 'express';
import Discover from '@/controllers/discoverController';
const router = express.Router();

router.get('/:slug', Discover.get);

export default router;
