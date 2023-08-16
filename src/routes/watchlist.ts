import express from 'express';
import watchlistController from '../controllers/WatchListController';

const router = express.Router();

// router.get('/:slug', tvController.detail);
router.get('/:accountid/:slug', watchlistController.index);
router.post('/:slug', watchlistController.handleWatchList);

export default router;
