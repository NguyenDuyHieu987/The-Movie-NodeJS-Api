import express from 'express';
import searchController from '../controllers/SearchController';

const router = express.Router();

// router.get('/:slug', tvController.detail);
router.get('/:slug', searchController.index);

export default router;
