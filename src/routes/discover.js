const express = require('express');
const router = express.Router();

const discoverRouterController = require('../app/controllers/DiscoverController');

// router.get('/:slug', tvController.detail);
router.get('/:slug', discoverRouterController.index);

module.exports = router;
