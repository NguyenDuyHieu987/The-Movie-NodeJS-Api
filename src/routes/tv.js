const express = require('express');
const router = express.Router();

const tvController = require('../app/controllers/TVController');

// router.get('/:slug', tvController.detail);
router.get('/:slug', tvController.index);
router.get('/:movieid/season/:seasonnumber', tvController.season);
router.post('/:movieid/:slug1', tvController.update);

module.exports = router;
