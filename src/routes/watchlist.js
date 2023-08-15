const express = require('express');
const router = express.Router();

const watchlistController = require('../app/controllers/WatchListController');

// router.get('/:slug', tvController.detail);
router.get('/:accountid/:slug', watchlistController.index);
router.post('/:slug', watchlistController.handleWatchList);

module.exports = router;
