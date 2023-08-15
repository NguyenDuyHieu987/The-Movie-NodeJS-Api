import express from 'express';
const router = express.Router();

const searchController = require('../app/controllers/SearchController');

// router.get('/:slug', tvController.detail);
router.get('/:slug', searchController.index);

export default router;
