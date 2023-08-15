const express = require('express');
const router = express.Router();

const movieController = require('../app/controllers/MovieController');

// router.get('/search', siteController.search);
router.get('/:slug', movieController.index);
router.post('/:movieid/:slug1', movieController.update);

module.exports = router;
