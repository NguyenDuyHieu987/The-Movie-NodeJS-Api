import express from 'express';
import discoverRouterController from '../controllers/DiscoverController';
const router = express.Router();

// router.get('/:slug', tvController.detail);
router.get('/:slug', discoverRouterController.index);

export default router;
