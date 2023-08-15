const express = require('express');
const router = express.Router();

const yearController = require('../app/controllers/YearController');

// router.get('/:slug', tvController.detail);
router.get('/:slug', yearController.index);

module.exports = router;
