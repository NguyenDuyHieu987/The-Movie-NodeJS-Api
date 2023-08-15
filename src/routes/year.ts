import express from 'express';
const router = express.Router();

const yearController = require('../app/controllers/YearController');

// router.get('/:slug', tvController.detail);
router.get('/:slug', yearController.index);

export default router;
