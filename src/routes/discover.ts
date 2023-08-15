import express from 'express';
const router = express.Router();

const discoverRouterController = require('../app/controllers/DiscoverController');

// router.get('/:slug', tvController.detail);
router.get('/:slug', discoverRouterController.index);

export default router;
