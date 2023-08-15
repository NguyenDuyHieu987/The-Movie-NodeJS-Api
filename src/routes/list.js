const express = require('express');
const router = express.Router();

const listController = require('../app/controllers/ListController');

// router.get('/:slug', tvController.detail);
router.get('/:slug', listController.index);
router.post('/:slug/add_item', listController.addItem);
router.post('/:slug/remove_item', listController.removeItem);

module.exports = router;
