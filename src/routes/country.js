const express = require('express');
const router = express.Router();

const countryController = require('../app/controllers/CountryController');

// router.get('/:slug', tvController.detail);
router.get('/:slug', countryController.index);

module.exports = router;
