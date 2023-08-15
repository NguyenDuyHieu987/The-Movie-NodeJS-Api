const express = require('express');
const router = express.Router();

const trendingController = require('../app/controllers/TrendingController');

// router.get('/search', siteController.search);
router.get('/:slug', trendingController.index);

module.exports = router;
