import express from 'express';
import Discovers from '@/controllers/discoverController';
const router = express.Router();

router.get('/:slug', Discovers.get);

export default router;
