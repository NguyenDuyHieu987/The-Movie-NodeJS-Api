import express from 'express';
const router = express.Router();

const genreController = require('../app/controllers/GenreController');

// router.get('/:slug', tvController.detail);
router.get('/:slug', genreController.index);

export default router;
