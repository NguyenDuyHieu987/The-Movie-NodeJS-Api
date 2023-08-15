import express from 'express';
const router = express.Router();

const watchlistController = require('../app/controllers/WatchListController');

// router.get('/:slug', tvController.detail);
router.get('/:accountid/:slug', watchlistController.index);
router.post('/:slug', watchlistController.handleWatchList);

export default router;
