const express = require('express');
const router = express.Router();

const genreController = require('../app/controllers/GenreController');

// router.get('/:slug', tvController.detail);
router.get('/:slug', genreController.index);

module.exports = router;
